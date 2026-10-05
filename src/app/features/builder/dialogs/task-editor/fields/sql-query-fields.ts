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

  /** Only SqlServer-protocol connections can be selected. */
  readonly connectionOptions = computed(() =>
    this.connections.scopedConnections().filter(c => c.protocol === 'SqlServer'),
  );

  readonly authOptions = this.auths.scopedProfiles;

  readonly queryText = computed(() => this.task().query ?? '');
  readonly outputKey = computed(() => this.task().outputKey ?? 'Rows');
  readonly timeoutValue = computed(() => this.task().queryTimeout ?? 60);
  readonly sampleResponseText = computed(() => this.task().sampleResponse ?? '[]');

  readonly preview = signal<string>('—');
  readonly previewStatus = signal<'idle' | 'ok' | 'error'>('idle');

  readonly selectedConnectionName = computed(() => {
    const id = this.task().connectionId;
    return id ? this.connections.nameById(id) : '';
  });

  onConnectionChange(v: string): void { this.task().connectionId = v; }
  onAuthChange(v: string): void { this.task().authId = v || undefined; }
  onQueryChange(v: string): void { this.task().query = v; }
  onTimeoutChange(v: string): void { this.task().queryTimeout = parseInt(v, 10) || 60; }
  onOutputKeyChange(v: string): void { this.task().outputKey = v; }
  onSampleResponseChange(v: string): void { this.task().sampleResponse = v; }

  onPreviewSample(): void {
    const raw = (this.task().sampleResponse ?? '').trim() || '[]';
    try {
      const parsed = JSON.parse(raw);
      const pretty = JSON.stringify(parsed, null, 2);
      this.preview.set(pretty);
      this.previewStatus.set('ok');
    } catch (e) {
      this.preview.set(`Invalid sample JSON: ${(e as Error).message}`);
      this.previewStatus.set('error');
    }
  }
}