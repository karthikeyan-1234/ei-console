import { Component, computed, inject, input } from '@angular/core';
import {
  ApiPullTask,
  FormField,
  HeaderEntry,
  HttpMethod,
} from '../../../../../core/models';
import { ConnectionService } from '../../../../../core/services/connection.service';
import { AuthProfileService } from '../../../../../core/services/auth-profile.service';
import { HeadersTableComponent } from '../../../../../shared/components/headers-table/headers-table';
import { FormFieldsTableComponent } from '../../../../../shared/components/form-fields-table/form-fields-table';

type BodyKind = 'Json' | 'Raw' | 'UrlEncoded' | 'FormData' | 'None';

@Component({
  selector: 'ei-api-pull-fields',
  imports: [HeadersTableComponent, FormFieldsTableComponent],
  templateUrl: './api-pull-fields.html',
})
export class ApiPullFieldsComponent {
  private readonly connections = inject(ConnectionService);
  private readonly auths = inject(AuthProfileService);

  readonly urlPlaceholder = '/posts?userId={{userId}} or /anything/{{$.id}}';
readonly headerValuePlaceholder = 'Bearer {{token}} or {{storeKey}}';

  readonly task = input.required<ApiPullTask>();

  readonly connectionOptions = this.connections.scopedConnections;
  readonly authOptions = this.auths.scopedProfiles;

  readonly methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

 // ------------------------------------------------------------------
// The task object is mutated in place by the field handlers. Angular's
// input signal does not emit on in-place mutation, so computed() values
// that read mutable fields would go stale. These are plain methods
// instead — the template calls them on every CD pass, and the change
// events from the form controls trigger a CD pass each time.
// ------------------------------------------------------------------

headers(): HeaderEntry[] {
  const t = this.task() as any;
  if (!t.headers) t.headers = [];
  return t.headers;
}

bodyKind(): BodyKind {
  return (this.task() as any).bodyKind ?? 'None';
}

bodyValue(): string {
  return (this.task() as any).body ?? '';
}

rawContentType(): string {
  return (this.task() as any).rawContentType ?? '';
}

formFields(): FormField[] {
  const t = this.task() as any;
  if (!t.formFields) t.formFields = [];
  return t.formFields;
}

showBody(): boolean {
  const m = (this.task().method ?? 'GET').toUpperCase();
  return m !== 'GET' && m !== 'HEAD';
}

  // ---- Handlers ----------------------------------------------------

  onConnectionChange(v: string): void { this.task().connectionId = v; }
  onAuthChange(v: string): void { this.task().authId = v || undefined; }
  onUrlChange(v: string): void { this.task().url = v; }
  onMethodChange(v: string): void { this.task().method = v as HttpMethod; }
  onTimeoutChange(v: string): void { this.task().timeout = parseInt(v, 10) || 30; }
  onOutputKeyChange(v: string): void { this.task().outputKey = v; }
  onSampleResponseChange(v: string): void { this.task().sampleResponse = v; }

  onBodyKindChange(v: string): void {
    (this.task() as any).bodyKind = v as BodyKind;
  }
  onBodyChange(v: string): void {
    (this.task() as any).body = v;
  }
  onRawContentTypeChange(v: string): void {
    (this.task() as any).rawContentType = v;
  }

  /** Template helper — Angular templates can't call String() directly. */
  same(a: unknown, b: unknown): boolean {
    return String(a ?? '') === String(b ?? '');
  }
}