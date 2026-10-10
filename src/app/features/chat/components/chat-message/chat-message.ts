import { Component, computed, input } from '@angular/core';
import { ChatMessage } from '../../../../core/models';

import { inject } from '@angular/core';
import { ChatService } from '../../../../core/services/chat.service';

@Component({
  selector: 'ei-chat-message',
  imports: [],
  templateUrl: './chat-message.html',
})
export class ChatMessageComponent {
  readonly message = input.required<ChatMessage>();

  readonly isUser = computed(() => this.message().role === 'user');
  readonly isAssistant = computed(() => this.message().role === 'assistant');
  readonly isSending = computed(() => this.message().status === 'sending');
  readonly isFailed = computed(() => this.message().status === 'failed');

  private readonly chat = inject(ChatService);

  readonly statusClass = computed(() => {
    const s = this.message().status;
    return s === 'sending' ? 'sending' : s === 'failed' ? 'failed' : '';
  });

  readonly showCopy = computed(() => !this.isSending() && !this.isFailed());

  readonly copied = { value: false };

  /** "2:45 PM" style local time. */
  formatTime(iso: string): string {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  async onCopy(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(this.message().content);
      this.copied.value = true;
      setTimeout(() => (this.copied.value = false), 1200);
    } catch {
      /* Clipboard API can reject in iframes; silently ignore. */
    }
  }

  async onRetry(): Promise<void> {
    await this.chat.retryMessage(this.message().id);
  }
}