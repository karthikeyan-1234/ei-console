import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ChatService } from '../../../../core/services/chat.service';


@Component({
  selector: 'ei-chat-composer',
  imports: [],
  templateUrl: './chat-composer.html',
})
export class ChatComposerComponent {
  private readonly chat = inject(ChatService);

  /** When true, the composer is disabled and the send button shows a spinner state. */
  readonly disabled = input<boolean>(false);

    readonly newChat = output<void>();

  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  readonly text = signal('');
  readonly canSend = computed(() => this.text().trim().length > 0 && !this.disabled());

  onInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.text.set(el.value);
    this.autoResize(el);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.submit();
    }
  }

  async submit(): Promise<void> {
    if (!this.canSend()) return;
    const value = this.text().trim();
    this.text.set('');
    const el = this.textareaRef()?.nativeElement;
    if (el) {
      el.value = '';
      this.autoResize(el);
      el.focus();
    }
    await this.chat.sendMessage(value);
  }

  focus(): void {
    this.textareaRef()?.nativeElement.focus();
  }

  private autoResize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

    onNewChat(): void {
    this.newChat.emit();
  }
}