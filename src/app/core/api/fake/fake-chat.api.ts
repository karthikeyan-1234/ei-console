import { Injectable } from '@angular/core';
import { ChatApi } from '../chat.api';
import {
  ChatMessage,
  ChatSession,
  ChatSessionSummary,
  CreateSessionInput,
  SendMessageResult,
} from '../../models';
import { SEED_CHAT_SESSIONS, SEED_CHAT_USER_ID } from './seed.data';
import { uid } from '../../utils/string.util';

/**
 * In-memory chat store, persisted to localStorage so that a page reload
 * preserves the conversation during development. When the .NET backend
 * arrives, this class is replaced by HttpChatApi and the storage key can be
 * removed.
 */
const STORAGE_KEY = 'ei.fake.chat.v1';

@Injectable()
export class FakeChatApi extends ChatApi {
  private rows: ChatSession[] = this.load();

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------

  private load(): ChatSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      /* Corrupted payload — fall through to the seed. */
    }
    return this.materializeSeed();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rows));
    } catch {
      /* Quota exceeded or private browsing. */
    }
  }

  /**
   * Converts the seed's `daysAgo` and `minutesAgo` offsets into real ISO
   * timestamps relative to "now". Every load from the seed produces the same
   * shape but fresh dates, so the history panel's buckets always have
   * representatives.
   */
  private materializeSeed(): ChatSession[] {
    const now = Date.now();
    return SEED_CHAT_SESSIONS.map(s => {
      const messages: ChatMessage[] = s.messages.map(m => {
        const ts = new Date(now - m.minutesAgo * 60_000);
        return {
          id: uid('msg'),
          sessionId: s.id,
          role: m.role,
          content: m.content,
          createdAt: ts.toISOString(),
          status: 'sent',
        };
      });
      // Sort ascending so the list renders oldest-first, newest-last.
      messages.sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
      const firstTs = messages[0]?.createdAt ?? new Date(now - s.daysAgo * 86_400_000).toISOString();
      const lastTs = messages[messages.length - 1]?.createdAt ?? firstTs;
      return {
        id: s.id,
        tenant: s.tenant,
        userId: s.userId,
        title: s.title,
        createdAt: firstTs,
        lastMessageAt: lastTs,
        lastMessagePreview: this.preview(messages[messages.length - 1]?.content ?? ''),
        messageCount: messages.length,
        messages,
      };
    });
  }

  private preview(text: string): string {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    return cleaned.length > 80 ? cleaned.slice(0, 80) + '…' : cleaned;
  }

  // -------------------------------------------------------------------------
  // ChatApi
  // -------------------------------------------------------------------------

  async listSessions(): Promise<ChatSessionSummary[]> {
    return this.rows
      .slice()
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
      .map(s => ({
        id: s.id,
        title: s.title,
        lastMessageAt: s.lastMessageAt,
        lastMessagePreview: s.lastMessagePreview,
        messageCount: s.messageCount,
      }));
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    const s = this.rows.find(r => r.id === id);
    return s ? JSON.parse(JSON.stringify(s)) : undefined;
  }

  async createSession(input: CreateSessionInput): Promise<ChatSession> {
    const now = new Date().toISOString();
    const created: ChatSession = {
      id: uid('chat'),
      tenant: input.tenant,
      userId: input.userId,
      title: input.title,
      createdAt: now,
      lastMessageAt: now,
      lastMessagePreview: '',
      messageCount: 0,
      messages: [],
    };
    this.rows.push(created);
    this.persist();
    return JSON.parse(JSON.stringify(created));
  }

  async renameSession(id: string, title: string): Promise<ChatSessionSummary> {
    const s = this.rows.find(r => r.id === id);
    if (!s) throw new Error(`Session not found: ${id}`);
    s.title = title;
    this.persist();
    return {
      id: s.id,
      title: s.title,
      lastMessageAt: s.lastMessageAt,
      lastMessagePreview: s.lastMessagePreview,
      messageCount: s.messageCount,
    };
  }

  async deleteSession(id: string): Promise<void> {
    this.rows = this.rows.filter(r => r.id !== id);
    this.persist();
  }

  async sendMessage(sessionId: string, content: string): Promise<SendMessageResult> {
    const session = this.rows.find(r => r.id === sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    const now = new Date();
    const userMessage: ChatMessage = {
      id: uid('msg'),
      sessionId,
      role: 'user',
      content,
      createdAt: now.toISOString(),
      status: 'sent',
    };

    // Simulate the orchestrator's think time.
    await new Promise(r => setTimeout(r, 900));

    const assistantMessage: ChatMessage = {
      id: uid('msg'),
      sessionId,
      role: 'assistant',
      content: this.composeResponse(content, session),
      createdAt: new Date().toISOString(),
      status: 'sent',
      model: 'fake-orchestrator-v1',
    };

    session.messages.push(userMessage, assistantMessage);
    session.messageCount = session.messages.length;
    session.lastMessageAt = assistantMessage.createdAt;
    session.lastMessagePreview = this.preview(assistantMessage.content);

    // If this is the first message, derive a title from it.
    if (session.messageCount === 2 && session.title === 'New chat') {
      session.title = this.deriveTitle(content);
    }

    this.persist();
    return {
      userMessage: JSON.parse(JSON.stringify(userMessage)),
      assistantMessage: JSON.parse(JSON.stringify(assistantMessage)),
    };
  }

  // -------------------------------------------------------------------------
  // Fake assistant
  // -------------------------------------------------------------------------

  private deriveTitle(firstUserMessage: string): string {
    const cleaned = firstUserMessage.replace(/\s+/g, ' ').trim();
    return cleaned.length > 50 ? cleaned.slice(0, 50) + '…' : cleaned;
  }

  private composeResponse(input: string, session: ChatSession): string {
    const q = input.toLowerCase();

    if (q.includes('fork')) {
      return 'A parallel fork is two or more consecutive Branch tasks in the pipeline. Click any arrow between blocks to select it as an insert point, then click Add fork in the pipeline toolbar. Every child of a fork sees the same pre-fork input, not the previous branch.';
    }
    if (q.includes('iterator') || q.includes('for-each') || q.includes('scatter')) {
      return 'An iterator marks a Transform whose output is an array. Its sub-tasks run once per element, bounded by the connection\u2019s Redis token bucket. Use it when every item looks the same \u2014 the twin of a fork, which handles heterogeneous entity types.';
    }
    if (q.includes('watermark')) {
      return 'A watermark is a durable checkpoint of the highest position in the source data you have successfully processed. Each run reads the cursor, asks the source for changes since that point, and advances the cursor only after every item is acknowledged. It turns a full sync into a delta sync.';
    }
    if (q.includes('credential') || q.includes('password') || q.includes('key vault')) {
      return 'Credentials for SQL Server, FTP, and SFTP can live in three places: a Key Vault reference, EI\u2019s own credential store, or inline on the profile. The credential store is the recommended path once encryption lands \u2014 rotate once and every referencing profile picks up the new value.';
    }
    if (q.includes('connection')) {
      return 'A connection describes where a task talks to: a base URL for HTTP protocols, a connection string fragment for SQL Server, or a host and port for FTP/SFTP. Every connection references an auth profile that supplies the credentials.';
    }
    if (q.includes('publish') || q.includes('version')) {
      return 'Publishing a job creates an immutable version snapshot. Runs pin to a version, so editing a job while it is executing does not affect the in-flight run. Drafts become Active the first time you publish.';
    }
    if (q.includes('dlq') || q.includes('dead letter') || q.includes('fail')) {
      return 'Failed work units land in the dead-letter queue with their full payload. Open the DLQ view to see the failure reason, then Replay an individual item without re-running the whole job. The item moves through the queue back into its execution.';
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return 'Hello. I can help with pipeline design, connection setup, credentials, watermarks, and the DLQ. What are you working on?';
    }
    if (q.includes('help') || q.includes('what can you')) {
      return 'I can answer questions about the EI console: composing pipelines, fork and iterator semantics, credentials and connections, job versioning, watermarks, and the DLQ. Ask away, or open the history panel to browse past conversations.';
    }
    if (session.messageCount > 4) {
      return 'Got it. Ask me anything else about the EI console, or open the history panel to revisit a previous conversation.';
    }
    return 'I am running in demo mode for now \u2014 the real orchestrator arrives with the .NET backend. In the meantime, ask me about pipelines, forks, iterators, connections, credentials, or watermarks.';
  }
}