export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** Optimistic UI hint. Set to 'sending' the moment the user hits Enter. */
  status: ChatMessageStatus;
  /** Populated by the backend. e.g. "gpt-4o", "claude-sonnet-4". */
  model?: string;
  /** Populated only when status === 'failed'. */
  error?: string;
}

export interface ChatSession {
  id: string;
  tenant: string;
  userId: string;
  title: string;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601. Updated on every message. Drives the history-panel buckets. */
  lastMessageAt: string;
  /** Short snippet of the most recent message. Rendered in the history list. */
  lastMessagePreview: string;
  messageCount: number;
  messages: ChatMessage[];
}

/**
 * A lighter shape used by the history panel. The full session (with messages)
 * is fetched lazily when the user clicks a history entry.
 */
export interface ChatSessionSummary {
  id: string;
  title: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  messageCount: number;
}

export interface CreateSessionInput {
  tenant: string;
  userId: string;
  title: string;
}

export interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}