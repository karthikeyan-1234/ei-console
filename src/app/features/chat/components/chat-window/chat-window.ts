import {
  Component,
  ViewChild,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatMessageListComponent } from '../chat-message-list/chat-message-list';
import { ChatComposerComponent } from '../chat-composer/chat-composer';
import { ChatHistoryPanelComponent } from '../chat-history-panel/chat-history-panel';

@Component({
  selector: 'ei-chat-window',
  imports: [ChatMessageListComponent, ChatComposerComponent, ChatHistoryPanelComponent],
  templateUrl: './chat-window.html',
})
export class ChatWindowComponent {
  private readonly chat = inject(ChatService);

  readonly closing = input<boolean>(false);

  readonly closed = output<void>();
  readonly historyToggled = output<void>();

  readonly isHistoryOpen = this.chat.isHistoryOpen;
  readonly messages = this.chat.messages;
  readonly isThinking = this.chat.isThinking;

    readonly newChatRequested = output<void>();

  @ViewChild(ChatComposerComponent)
  private composer?: ChatComposerComponent;

  constructor() {
    // Focus the composer whenever the window opens. The 260ms delay lets
    // the open animation finish before we steal focus, so the caret doesn't
    // appear mid-animation.
    effect(() => {
      if (this.closing()) return;
      setTimeout(() => this.composer?.focus(), 260);
    });
  }

  onClose(): void {
    this.closed.emit();
  }

  onToggleHistory(): void {
    this.historyToggled.emit();
  }

  /** Called when a session is picked from the panel — auto-collapses it. */
  onHistoryClosed(): void {
    this.chat.closeHistory();
  }

  /** Called when a session or the New-chat button is used — same effect. */
  onSessionPicked(): void {
    this.chat.closeHistory();
  }

    onNewChatRequested(): void {
    this.newChatRequested.emit();
  }
}