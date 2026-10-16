import { Component, computed, inject, input } from '@angular/core';
import {
  ApiPushTask,
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
  selector: 'ei-api-push-fields',
  imports: [HeadersTableComponent, FormFieldsTableComponent],
  templateUrl: './api-push-fields.html',
})
export class ApiPushFieldsComponent {
  private readonly connections = inject(ConnectionService);
  private readonly auths = inject(AuthProfileService);

  readonly urlPlaceholder = '/posts?userId={{userId}} or /anything/{{$.id}}';
readonly headerValuePlaceholder = 'Bearer {{token}} or {{storeKey}}';

  readonly task = input.required<ApiPushTask>();

  readonly connectionOptions = this.connections.scopedConnections;
  readonly authOptions = this.auths.scopedProfiles;

  

  readonly methods: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE', 'GET'];

headers(): HeaderEntry[] {
  const t = this.task() as any;
  if (!t.headers) t.headers = [];
  return t.headers;
}
bodyKind(): BodyKind {
  return (this.task() as any).bodyKind ?? 'Json';
}

bodyValue(): string {
  return (this.task() as any).body ?? '{"id":$item.id}';
}

rawContentType(): string {
  return (this.task() as any).rawContentType ?? '';
}

formFields(): FormField[] {
  const t = this.task() as any;
  if (!t.formFields) t.formFields = [];
  return t.formFields;
}

  onConnectionChange(v: string): void { this.task().connectionId = v; }
  onAuthChange(v: string): void { this.task().authId = v || undefined; }
  onUrlChange(v: string): void { this.task().url = v; }
  onMethodChange(v: string): void { this.task().method = v as HttpMethod; }
  onTimeoutChange(v: string): void { this.task().timeout = parseInt(v, 10) || 30; }
  onBodyChange(v: string): void { (this.task() as any).body = v; }

  onBodyKindChange(v: string): void {
    (this.task() as any).bodyKind = v as BodyKind;
  }
  onRawContentTypeChange(v: string): void {
    (this.task() as any).rawContentType = v;
  }

  same(a: unknown, b: unknown): boolean {
    return String(a ?? '') === String(b ?? '');
  }
}