import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChatApi } from '../chat.api';
import {
  ChatSession,
  ChatSessionSummary,
  CreateSessionInput,
  SendMessageResult,
} from '../../models';
import { environment } from '../../../../environments/environment';

@Injectable()
export class HttpChatApi extends ChatApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/chat/sessions`;

  listSessions() {
    return firstValueFrom(this.http.get<ChatSessionSummary[]>(this.base));
  }

  getSession(id: string) {
    return firstValueFrom(this.http.get<ChatSession | undefined>(`${this.base}/${id}`));
  }

  createSession(input: CreateSessionInput) {
    return firstValueFrom(this.http.post<ChatSession>(this.base, input));
  }

  renameSession(id: string, title: string) {
    return firstValueFrom(
      this.http.patch<ChatSessionSummary>(`${this.base}/${id}`, { title }),
    );
  }

  deleteSession(id: string) {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }

  sendMessage(sessionId: string, content: string) {
    return firstValueFrom(
      this.http.post<SendMessageResult>(`${this.base}/${sessionId}/messages`, {
        content,
      }),
    );
  }
}