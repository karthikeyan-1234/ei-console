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


  // src/app/core/api/http/http-chat.api.ts
async sendMessage(
  sessionId: string, 
  content: string, 
  onToken: (token: string) => void
): Promise<SendMessageResult> {
  const url = `${this.base}/${sessionId}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  if (!response.body) throw new Error('No readable stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let finalResult: SendMessageResult | undefined;
  let buffer = ''; // Buffer to handle split chunks

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // Keep the last partial line in the buffer
    buffer = lines.pop() || ''; 

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'token') {
            onToken(parsed.value);
          } else if (parsed.type === 'result') {
            finalResult = parsed.value;
          }
        } catch (e) {
          console.error('Failed to parse SSE event', data, e);
        }
      }
    }
  }

  if (!finalResult) {
    throw new Error('Stream ended without receiving the final result payload');
  }
  
  return finalResult;
}


}