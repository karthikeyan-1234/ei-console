import { Component, computed, inject, input, output } from '@angular/core';
import { ChatSessionSummary } from '../../../../core/models';
import { ChatService } from '../../../../core/services/chat.service';
import { groupByDate } from '../../../../core/utils/date-grouping.util';
import {
  ChatHistoryItemComponent,
  ChatRenameEvent,
} from '../chat-history-item/chat-history-item';

@Component({
  selector: 'ei-chat-history-panel',
  imports: [ChatHistoryItemComponent],
  templateUrl: './chat-history-panel.html',
})
export class ChatHistoryPanelComponent {
  private readonly chat = inject(ChatService);

  readonly open = input.required<boolean>();

  readonly closed = output<void>();
  readonly sessionPicked = output<void>();

  readonly sessions = this.chat.sessions;
  readonly activeSessionId = this.chat.activeSessionId;

  /**
   * Grouped structure the template iterates. Recomputed whenever the sessions
   * signal changes — including when a message is sent, a session renamed, or
   * a session deleted.
   */
  readonly groups = computed(() =>
    groupByDate(this.sessions()),
  );

  readonly isEmpty = computed(() => this.sessions().length === 0);

  onSelect(id: string): void {
    void this.chat.selectSession(id).then(() => {
      this.sessionPicked.emit();
    });
  }

  onRename(event: ChatRenameEvent): void {
    void this.chat.renameSession(event.id, event.title);
  }

  onNewChat(): void {
    this.chat.startNewSession();
    this.sessionPicked.emit();
  }

  onScrimClick(): void {
    this.closed.emit();
  }
}