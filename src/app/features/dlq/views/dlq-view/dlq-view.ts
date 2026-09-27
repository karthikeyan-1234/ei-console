import { Component, inject } from '@angular/core';
import { DlqService } from '../../../../core/services/dlq.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'ei-dlq-view',
  imports: [],
  templateUrl: './dlq-view.html',
})
export class DlqViewComponent {
  private readonly dlq = inject(DlqService);
  private readonly toasts = inject(ToastService);

  readonly rows = this.dlq.items;

  onRefresh(): void {
    this.toasts.success('DLQ refreshed');
  }

  async onReplay(id: string): Promise<void> {
    this.toasts.success(`Replaying ${id}`);
    await this.dlq.replay(id);
  }

  onView(id: string): void {
    this.toasts.info(`Viewing ${id}`);
  }
}