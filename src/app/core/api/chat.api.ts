import { InjectionToken } from '@angular/core';
import {
  ChatSession,
  ChatSessionSummary,
  CreateSessionInput,
  SendMessageResult,
} from '../models';

export abstract class ChatApi {
  /** All sessions for the current tenant + user, newest first. */
  abstract listSessions(): Promise<ChatSessionSummary[]>;

  /** Full session including messages. */
  abstract getSession(id: string): Promise<ChatSession | undefined>;

  /** Creates an empty session. Called lazily on first message. */
  abstract createSession(input: CreateSessionInput): Promise<ChatSession>;

  /** Renames a session. Returns the updated summary. */
  abstract renameSession(id: string, title: string): Promise<ChatSessionSummary>;

  /** Deletes a session and all its messages. */
  abstract deleteSession(id: string): Promise<void>;

  /**
   * Sends a user message and returns both the persisted user message and the
   * assistant's reply. On the eventual .NET backend this becomes a streaming
   * call; the shape of the return value stays the same for the fake.
   */
  abstract sendMessage(sessionId: string, content: string): Promise<SendMessageResult>;
}

export const CHAT_API = new InjectionToken<ChatApi>('CHAT_API');