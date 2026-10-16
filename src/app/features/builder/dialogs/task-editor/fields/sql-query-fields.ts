import { Component, computed, inject, input, signal } from '@angular/core';
import { SqlQueryTask } from '../../../../../core/models';
import { ConnectionService } from '../../../../../core/services/connection.service';
import { AuthProfileService } from '../../../../../core/services/auth-profile.service';

@Component({
  selector: 'ei-sql-query-fields',
  imports: [],
  templateUrl: './sql-query-fields.html',
})
export class SqlQueryFieldsComponent {
  private readonly connections = inject(ConnectionService);
  private readonly auths = inject(AuthProfileService);

  readonly task = input.required<SqlQueryTask>();

  /** Service-backed signals, safe as computed. */
  readonly connectionOptions = computed(() =>
    this.connections.scopedConnections().filter(c => c.protocol === 'SqlServer'),
  );
  readonly authOptions = this.auths.scopedProfiles;

  // -----------------------------------------------------------------
  // Methods — task is mutated in place.
  // -----------------------------------------------------------------

  queryText(): string { return this.task().query ?? ''; }
  outputKey(): string { return this.task().outputKey ?? 'Rows'; }
  timeoutValue(): number { return this.task().queryTimeout ?? 60; }
  sampleResponseText(): string { return this.task().sampleResponse ?? '[]'; }
  queryMode(): SqlQueryTask['queryMode'] { return this.task().queryMode ?? 'Reader'; }

  selectedConnectionName(): string {
    const id = this.task().connectionId;
    return id ? this.connections.nameById(id) : '';
  }

  readonly preview = signal<string>('—');
  readonly previewStatus = signal<'idle' | 'ok' | 'error'>('idle');

  onConnectionChange(v: string): void { this.task().connectionId = v; }
  onAuthChange(v: string): void { this.task().authId = v || undefined; }
  onQueryChange(v: string): void { this.task().query = v; }
  onTimeoutChange(v: string): void { this.task().queryTimeout = parseInt(v, 10) || 60; }
  onOutputKeyChange(v: string): void { this.task().outputKey = v; }
  onSampleResponseChange(v: string): void { this.task().sampleResponse = v; }
  onQueryModeChange(v: string): void {
    this.task().queryMode = v as SqlQueryTask['queryMode'];
  }

  onPreviewSample(): void {
    const raw = (this.task().sampleResponse ?? '').trim() || '[]';
    try {
      const parsed = JSON.parse(raw);
      this.preview.set(JSON.stringify(parsed, null, 2));
      this.previewStatus.set('ok');
    } catch (e) {
      this.preview.set(`Invalid sample JSON: ${(e as Error).message}`);
      this.previewStatus.set('error');
    }
  }

  same(a: unknown, b: unknown): boolean {
    return String(a ?? '') === String(b ?? '');
  }
}