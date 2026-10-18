import { Injectable, computed, inject, signal } from '@angular/core';
import { CHAT_API, ChatApi } from '../api/chat.api';
import {
  ChatMessage,
  ChatSession,
  ChatSessionSummary,
} from '../models';
import { TenantService } from './tenant.service';
import { SEED_CHAT_USER_ID } from '../api/fake/seed.data';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject<ChatApi>(CHAT_API);
  private tenants = inject(TenantService);

  // ---------------------------------------------------------------------------
  // UI state
  // ---------------------------------------------------------------------------

  private readonly _isOpen = signal(false);
  private readonly _isHistoryOpen = signal(false);
  private readonly _isThinking = signal(false);
  private readonly _hasUnread = signal(false);

  readonly isOpen = this._isOpen.asReadonly();
  readonly isHistoryOpen = this._isHistoryOpen.asReadonly();
  readonly isThinking = this._isThinking.asReadonly();
  readonly hasUnread = this._hasUnread.asReadonly();

  toggleWindow(): void {
    this._isOpen.update(v => !v);
    if (this._isOpen()) this._hasUnread.set(false);
  }

  openWindow(): void {
    this._isOpen.set(true);
    this._hasUnread.set(false);
  }

  closeWindow(): void {
    this._isOpen.set(false);
  }

  toggleHistory(): void {
    this._isHistoryOpen.update(v => !v);
  }

  closeHistory(): void {
    this._isHistoryOpen.set(false);
  }

  // ---------------------------------------------------------------------------
  // Data state
  // ---------------------------------------------------------------------------

  private readonly _sessions = signal<ChatSessionSummary[]>([]);
  private readonly _activeSessionId = signal<string | null>(null);
  private _messages = signal<ChatMessage[]>([]);
  private readonly _loaded = signal(false);

  readonly sessions = this._sessions.asReadonly();
  readonly activeSessionId = this._activeSessionId.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly activeSession = computed<ChatSessionSummary | null>(() => {
    const id = this._activeSessionId();
    if (!id) return null;
    return this._sessions().find(s => s.id === id) ?? null;
  });

  readonly hasMessages = computed(() => this._messages().length > 0);

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  async load(): Promise<void> {
    const list = await this.api.listSessions();
    this._sessions.set(list);
    this._loaded.set(true);
  }

  // ---------------------------------------------------------------------------
  // Session selection
  // ---------------------------------------------------------------------------

  async selectSession(id: string): Promise<void> {
    const session = await this.api.getSession(id);
    if (!session) return;
    this._activeSessionId.set(id);
    this._messages.set(session.messages);
  }

  /** Clears the active session. The next sent message creates a new one. */
  startNewSession(): void {
    this._activeSessionId.set(null);
    this._messages.set([]);
  }

  // ---------------------------------------------------------------------------
  // Sending
  // ---------------------------------------------------------------------------

async sendMessage(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return;

  let sessionId = this.activeSessionId();
  
  // If there's no active session, create one on the fly
  if (!sessionId) {
    const newSession = await this.api.createSession({ 
      title: 'New Chat',
      tenant: this.tenants.activeTenantId() || '1',
      userId: '1' 
    });
    this._sessions.update(s => [newSession, ...s]);
    sessionId = newSession.id;
    this._activeSessionId.set(sessionId);
  }

  // 1. Create optimistic placeholders
  const optimisticUser: ChatMessage = {
    id: 'temp-user-' + Date.now(),
    sessionId,
    role: 'user',
    content: trimmed,
    status: 'sending',
    createdAt: new Date().toISOString()
  };

  const optimisticAssistantId = 'temp-assistant-' + Date.now();
  const optimisticAssistant: ChatMessage = {
    id: optimisticAssistantId,
    sessionId,
    role: 'assistant',
    content: '',
    status: 'sending',
    createdAt: new Date().toISOString()
  };

  // 2. Add them to the UI immediately
  this._messages.update(msgs => [...msgs, optimisticUser, optimisticAssistant]);

  try {
    // 3. Call API and stream tokens
    const result = await this.api.sendMessage(sessionId, trimmed, (token) => {
      this._messages.update(msgs => msgs.map(m => 
        m.id === optimisticAssistantId ? { ...m, content: m.content + token } : m
      ));
    });

    // 4. Reconcile with real DB records
    this._messages.update(msgs => 
      msgs.map(msg => {
        if (msg.id === optimisticUser.id) return result.userMessage || msg;
        if (msg.id === optimisticAssistantId) return result.assistantMessage || msg;
        return msg;
      })
    );

        // 5. Update the session sidebar safely
    if (result.session) {
      this._sessions.update(sessions => 
        sessions.map(s => s.id === sessionId ? result.session : s)
      );
    }

  } catch (err) {
    console.error('[ChatService] Stream failed:', err);
    this._messages.update(msgs => msgs.map(m => 
      m.id === optimisticAssistantId ? { ...m, status: 'failed' } : m
    ));
  }
}


  /**
   * Resends a failed message. The failed entry is removed and the same
   * content is sent again, which creates a fresh optimistic bubble and a new
   * API call. If the retry succeeds, the user sees exactly one copy of the
   * message; if it fails again, they see one failed entry with a retry link.
   */

async retryMessage(failedMessageId: string): Promise<void> {
  const failed = this._messages().find(m => m.id === failedMessageId);
  if (!failed || failed.status !== 'failed') return;

  // Drop the failed entry before re-sending
  this._messages.update(list => list.filter(m => m.id !== failedMessageId));

  // Now this will compile perfectly because sendMessage takes exactly 1 argument
  await this.sendMessage(failed.content);
}


  // ---------------------------------------------------------------------------
  // Rename / delete
  // ---------------------------------------------------------------------------

  async renameSession(id: string, title: string): Promise<void> {
    const updated = await this.api.renameSession(id, title.trim() || 'Untitled');
    this._sessions.update(list =>
      list.map(s => (s.id === id ? updated : s)),
    );
  }

  async deleteSession(id: string): Promise<void> {
    await this.api.deleteSession(id);
    this._sessions.update(list => list.filter(s => s.id !== id));
    if (this._activeSessionId() === id) {
      this._activeSessionId.set(null);
      this._messages.set([]);
    }
  }

  // ---------------------------------------------------------------------------
  // Reset (dev helper, mirrors the demo reset elsewhere)
  // ---------------------------------------------------------------------------

  reset(): void {
    this._isOpen.set(false);
    this._isHistoryOpen.set(false);
    this._isThinking.set(false);
    this._hasUnread.set(false);
    this._activeSessionId.set(null);
    this._messages.set([]);
    void this.load();
  }
}