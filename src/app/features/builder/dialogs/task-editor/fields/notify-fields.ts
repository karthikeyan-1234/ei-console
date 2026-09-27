import { Component, computed, input, signal } from '@angular/core';
import { NotifyTask } from '../../../../../core/models';

type NotifyMedium = 'kafka' | 'webhook';

@Component({
  selector: 'ei-notify-fields',
  imports: [],
  templateUrl: './notify-fields.html',
})
export class NotifyFieldsComponent {
  readonly task = input.required<NotifyTask>();

  /**
   * Local override for the medium radio. Null means "not chosen this session" —
   * the component then derives it from the task's current fields. Once the
   * user picks a medium, we remember it for the lifetime of this editor open.
   */
  private readonly _mediumOverride = signal<NotifyMedium | null>(null);

  readonly medium = computed<NotifyMedium>(() => {
    const override = this._mediumOverride();
    if (override) return override;
    const t = this.task();
    // Seeded with a URL but no topic → webhook. Otherwise default to kafka.
    return t.url && !t.kafkaTopic ? 'webhook' : 'kafka';
  });

  readonly kafkaTopic = computed(() => this.task().kafkaTopic ?? '');
  readonly url = computed(() => this.task().url ?? '');
  readonly body = computed(() => this.task().body ?? '{"event":"job.completed"}');
  readonly timeout = computed(() => this.task().timeout ?? 10);

  onMediumChange(v: string): void {
    const next = v as NotifyMedium;
    this._mediumOverride.set(next);

    // Clear the inactive medium's field so a saved task carries exactly one.
    const t = this.task();
    if (next === 'kafka') t.url = undefined;
    else t.kafkaTopic = undefined;
  }

  onKafkaTopicChange(v: string): void { this.task().kafkaTopic = v; }
  onUrlChange(v: string): void { this.task().url = v; }
  onBodyChange(v: string): void { this.task().body = v; }
  onTimeoutChange(v: string): void { this.task().timeout = parseInt(v, 10) || 10; }
}