import {
  Component,
  HostListener,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ChatService } from '../../core/services/chat.service';
import { ChatBubbleComponent } from './components/chat-bubble/chat-bubble';
import { ChatWindowComponent } from './components/chat-window/chat-window';

@Component({
  selector: 'ei-chat-bot',
  imports: [ChatBubbleComponent, ChatWindowComponent],
  templateUrl: './chat-bot.html',
})
export class ChatBotComponent {
  private readonly chat = inject(ChatService);

  readonly isOpen = this.chat.isOpen;

  /**
   * `showWindow` lags `isOpen` by the length of the close animation. When the
   * window is closing, both are true and `isClosing` is also true, which
   * triggers the exit animation. When the animation finishes, `showWindow`
   * flips to false and the bubble re-appears.
   */
  readonly showWindow = signal(false);
  readonly isClosing = signal(false);

  private readonly closeAnimationMs = 220; // matches .chat-window.closing animation

  constructor() {
    effect(() => {
      const open = this.isOpen();

      if (open) {
        this.isClosing.set(false);
        this.showWindow.set(true);
        return;
      }

      if (this.showWindow()) {
        this.isClosing.set(true);
        setTimeout(() => {
          this.showWindow.set(false);
          this.isClosing.set(false);
        }, this.closeAnimationMs);
      }
    });
  }

  /**
   * Esc handling. Two-stage dismissal: if the history panel is open, close
   * it first; a second press closes the window. That matches the drill-down
   * mental model — back out one level at a time.
   */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isOpen()) return;
    if (this.chat.isHistoryOpen()) {
      this.chat.closeHistory();
      return;
    }
    this.chat.closeWindow();
  }

  onBubbleClicked(): void {
    this.chat.openWindow();
  }

  onWindowClosed(): void {
    this.chat.closeWindow();
  }

  onHistoryToggled(): void {
    this.chat.toggleHistory();
  }

  onNewChatRequested(): void {
    this.chat.startNewSession();
    // Collapse the history panel if it was open, so the user sees the cleared
    // message area rather than staring at a list of old conversations.
    if (this.chat.isHistoryOpen()) this.chat.closeHistory();
  }
}