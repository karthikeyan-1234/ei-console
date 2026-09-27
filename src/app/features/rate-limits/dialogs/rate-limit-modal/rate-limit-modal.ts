import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { RateLimit, RateLimitScope } from '../../../../core/models';
import { ConnectionService } from '../../../../core/services/connection.service';
import { RateLimitService } from '../../../../core/services/rate-limit.service';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';

export interface RateLimitSaveEvent {
  rateLimit: RateLimit;
  patch: Partial<RateLimit>;
  isNew: boolean;
}

@Component({
  selector: 'ei-rate-limit-modal',
  imports: [ModalShellComponent],
  templateUrl: './rate-limit-modal.html',
})
export class RateLimitModalComponent implements OnInit {
  private readonly connections = inject(ConnectionService);
  private readonly rateLimits = inject(RateLimitService);

  readonly rateLimit = input<RateLimit | null>(null);

  readonly saved = output<RateLimitSaveEvent>();
  readonly cancelled = output<void>();

  readonly connectionId = signal('');
  readonly scope = signal<RateLimitScope>('PerConnection');
  readonly rps = signal(50);
  readonly burst = signal(100);
  readonly concurrent = signal(20);
  readonly error = signal<string | null>(null);

  readonly isEdit = computed(() => this.rateLimit() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit Rate Limit' : 'New Rate Limit'));
  readonly subtitle = computed(() =>
    this.isEdit() ? 'Update the fleet-wide limit' : 'Configure a fleet-wide limit',
  );

  /** Every connection, regardless of tenant — the original console listed them all. */
  readonly connectionOptions = computed(() =>
    this.connections.connections(),
  );

  ngOnInit(): void {
    const r = this.rateLimit();
    if (r) {
      this.connectionId.set(r.connectionId);
      this.scope.set(r.scope);
      this.rps.set(r.rps);
      this.burst.set(r.burst);
      this.concurrent.set(r.concurrent);
    }
  }

  onConnectionInput(v: string): void { this.connectionId.set(v); }
  onScopeInput(v: string): void { this.scope.set(v as RateLimitScope); }
  onRpsInput(v: string): void { this.rps.set(parseInt(v, 10) || 1); }
  onBurstInput(v: string): void { this.burst.set(parseInt(v, 10) || 1); }
  onConcurrentInput(v: string): void { this.concurrent.set(parseInt(v, 10) || 1); }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSave(): void {
    this.error.set(null);

    const connectionId = this.connectionId();
    if (!connectionId) { this.error.set('Connection required'); return; }

    if (!this.connections.byId(connectionId)) {
      this.error.set('That connection no longer exists');
      return;
    }

    // Uniqueness: one rate limit per connection, excluding self when editing.
    const editingId = this.rateLimit()?.id;
    const duplicate = this.rateLimits
      .policies()
      .find(r => r.connectionId === connectionId && r.id !== editingId);

    if (duplicate) {
      this.error.set(
        `"${this.connections.nameById(connectionId)}" already has a rate limit policy`,
      );
      return;
    }

    const payload: Partial<RateLimit> = {
      connectionId,
      scope: this.scope(),
      rps: this.rps(),
      burst: this.burst(),
      concurrent: this.concurrent(),
    };

    const r = this.rateLimit();
    if (r) {
      this.saved.emit({ rateLimit: r, patch: payload, isNew: false });
      return;
    }

    this.saved.emit({
      rateLimit: {
        id: '',
        connectionId,
        scope: payload.scope!,
        rps: payload.rps!,
        burst: payload.burst!,
        concurrent: payload.concurrent!,
      },
      patch: {},
      isNew: true,
    });
  }
}