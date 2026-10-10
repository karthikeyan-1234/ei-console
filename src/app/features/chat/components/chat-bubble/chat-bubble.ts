import { Component, OnDestroy, OnInit, effect, inject, output } from '@angular/core';
import { ChatService } from '../../../../core/services/chat.service';
import { IdleAnimationService } from '../../../../core/services/idle-animation.service';

@Component({
  selector: 'ei-chat-bubble',
  imports: [],
  templateUrl: './chat-bubble.html',
})
export class ChatBubbleComponent implements OnInit, OnDestroy {
  private readonly idle = inject(IdleAnimationService);
  private readonly chat = inject(ChatService);

  readonly opened = output<void>();

  readonly hasUnread = this.chat.hasUnread;
  readonly animation = this.idle.current;

  constructor() {
    // When the unread flag flips to true — the assistant replied while the
    // window was closed — fire a one-shot pulse so the collapsed head draws
    // the user's eye without being obnoxious.
    effect(() => {
      if (this.hasUnread()) {
        this.idle.trigger('pulse');
      }
    });
  }

  ngOnInit(): void {
    this.idle.start();
  }

  ngOnDestroy(): void {
    this.idle.stop();
  }

  onClick(): void {
    this.opened.emit();
  }
}