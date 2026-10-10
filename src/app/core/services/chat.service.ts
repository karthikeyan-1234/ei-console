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
  private readonly _messages = signal<ChatMessage[]>([]);
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

  async sendMessage(content: string): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed || this._isThinking()) return;

    // Create a session lazily on the first message.
    let sessionId = this._activeSessionId();
    if (!sessionId) {
      const created = await this.api.createSession({
        tenant: this.tenants.activeTenantId(),
        userId: SEED_CHAT_USER_ID,
        title: 'New chat',
      });
      sessionId = created.id;
      this._activeSessionId.set(sessionId);
      // Refresh the sessions list so the new one appears in the history panel.
      this._sessions.set(await this.api.listSessions());
    }

    // Optimistic user bubble.
    const optimistic: ChatMessage = {
      id: 'optimistic-' + Math.random().toString(36).slice(2, 9),
      sessionId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    this._messages.update(m => [...m, optimistic]);
    this._isThinking.set(true);

    try {
      const result = await this.api.sendMessage(sessionId, trimmed);
      // Replace the optimistic bubble with the server's version, then append
      // the assistant's reply.
      this._messages.update(m =>
        m
          .map(msg => (msg.id === optimistic.id ? result.userMessage : msg))
          .concat(result.assistantMessage),
      );
      // Refresh session list so previews and order update.
      this._sessions.set(await this.api.listSessions());
      if (!this._isOpen()) this._hasUnread.set(true);
    } catch (err) {
      this._messages.update(m =>
        m.map(msg =>
          msg.id === optimistic.id
            ? { ...msg, status: 'failed' as const, error: (err as Error).message }
            : msg,
        ),
      );
    } finally {
      this._isThinking.set(false);
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

    // Drop the failed entry before re-sending so we don't leave it in place
    // while the new optimistic bubble is created.
    this._messages.update(list => list.filter(m => m.id !== failedMessageId));

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