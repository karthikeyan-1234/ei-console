import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ChatSessionSummary } from '../../../../core/models';
import { formatRelativeTime } from '../../../../core/utils/date-grouping.util';

export interface ChatRenameEvent {
  id: string;
  title: string;
}

@Component({
  selector: 'ei-chat-history-item',
  imports: [],
  templateUrl: './chat-history-item.html',
})
export class ChatHistoryItemComponent {
  readonly session = input.required<ChatSessionSummary>();
  readonly isActive = input<boolean>(false);

  readonly selected = output<string>();
  readonly renamed = output<ChatRenameEvent>();

  readonly isRenaming = signal(false);
  readonly renameText = signal('');

  private readonly renameInputRef = viewChild<ElementRef<HTMLInputElement>>('renameInput');

  readonly relativeTime = computed(() =>
    formatRelativeTime(this.session().lastMessageAt),
  );

  constructor() {
    // Focus the rename input the moment it appears. `afterNextRender` isn't
    // appropriate here because the input renders conditionally inside an @if,
    // so we react to the signal instead.
    effect(() => {
      if (this.isRenaming()) {
        setTimeout(() => {
          const el = this.renameInputRef()?.nativeElement;
          if (el) {
            el.focus();
            el.select();
          }
        }, 0);
      }
    });
  }

  onSelect(): void {
    if (this.isRenaming()) return;
    this.selected.emit(this.session().id);
  }

  onRenameStart(event: MouseEvent): void {
    event.stopPropagation();
    this.renameText.set(this.session().title);
    this.isRenaming.set(true);
  }

  onRenameInput(event: Event): void {
    this.renameText.set((event.target as HTMLInputElement).value);
  }

  onRenameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onRenameCommit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onRenameCancel();
    }
  }

  onRenameCommit(): void {
    const text = this.renameText().trim();
    this.isRenaming.set(false);
    if (!text || text === this.session().title) return;
    this.renamed.emit({ id: this.session().id, title: text });
  }

  onRenameCancel(): void {
    this.isRenaming.set(false);
  }

  onRenameBlur(): void {
    // Commit on blur rather than discard — feels less punishing if the user
    // clicks away by accident.
    this.onRenameCommit();
  }
}