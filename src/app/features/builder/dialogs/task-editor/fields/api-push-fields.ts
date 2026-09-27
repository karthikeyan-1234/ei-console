import { Component, computed, inject, input } from '@angular/core';
import { ApiPushTask, HttpMethod } from '../../../../../core/models';
import { ConnectionService } from '../../../../../core/services/connection.service';
import { AuthProfileService } from '../../../../../core/services/auth-profile.service';

@Component({
  selector: 'ei-api-push-fields',
  imports: [],
  templateUrl: './api-push-fields.html',
})
export class ApiPushFieldsComponent {
  private readonly connections = inject(ConnectionService);
  private readonly auths = inject(AuthProfileService);

  readonly task = input.required<ApiPushTask>();

  readonly connectionOptions = this.connections.scopedConnections;
  readonly authOptions = this.auths.scopedProfiles;

  readonly methods: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'];

  /** Body value with a sensible default, kept out of the template to avoid
   *  Angular interpreting the JSON braces as interpolation. */
  readonly bodyValue = computed(() => this.task().body ?? '{"id":$item.id}');

  onConnectionChange(v: string): void { this.task().connectionId = v; }
  onAuthChange(v: string): void { this.task().authId = v || undefined; }
  onUrlChange(v: string): void { this.task().url = v; }
  onMethodChange(v: string): void { this.task().method = v as HttpMethod; }
  onTimeoutChange(v: string): void { this.task().timeout = parseInt(v, 10) || 30; }
  onBodyChange(v: string): void { this.task().body = v; }
}