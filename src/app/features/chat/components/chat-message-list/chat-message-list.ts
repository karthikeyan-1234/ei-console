import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ChatMessage } from '../../../../core/models';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatMessageComponent } from '../chat-message/chat-message';

@Component({
  selector: 'ei-chat-message-list',
  imports: [ChatMessageComponent],
  templateUrl: './chat-message-list.html',
})
export class ChatMessageListComponent {
  private readonly chat = inject(ChatService);

  readonly messages = input.required<ChatMessage[]>();
  readonly isThinking = input<boolean>(false);

  readonly hintPrompts: string[] = [
    'How do I add a parallel fork?',
    'Explain the difference between an iterator and a fork',
    'Why do I need watermarks?',
    'How do I set up an SFTP connection?',
  ];

  private readonly scrollRef = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  /** True when the user is currently pinned to the bottom of the list. */
  private readonly isPinned = signal(true);
  readonly showJumpToLatest = computed(() => !this.isPinned());

  constructor() {
    // Initial pin: scroll to bottom once the list first renders.
    afterNextRender(() => this.scrollToBottom());

    // Auto-scroll whenever messages or the thinking indicator change,
    // but only if the user hasn't scrolled up.
    effect(() => {
      this.messages();
      this.isThinking();
      if (this.isPinned()) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  onScroll(): void {
    const el = this.scrollRef()?.nativeElement;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    this.isPinned.set(atBottom);
  }

  scrollToBottom(): void {
    const el = this.scrollRef()?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    this.isPinned.set(true);
  }

  onHintClick(text: string): void {
    void this.chat.sendMessage(text);
  }
}