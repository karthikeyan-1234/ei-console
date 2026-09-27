import { Component, computed, inject, input } from '@angular/core';
import { ApiPullTask, HttpMethod } from '../../../../../core/models';
import { ConnectionService } from '../../../../../core/services/connection.service';
import { AuthProfileService } from '../../../../../core/services/auth-profile.service';

@Component({
  selector: 'ei-api-pull-fields',
  imports: [],
  templateUrl: './api-pull-fields.html',
})
export class ApiPullFieldsComponent {
  private readonly connections = inject(ConnectionService);
  private readonly auths = inject(AuthProfileService);

  readonly task = input.required<ApiPullTask>();

  readonly connectionOptions = this.connections.scopedConnections;
  readonly authOptions = this.auths.scopedProfiles;

  readonly methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  onConnectionChange(v: string): void { this.task().connectionId = v; }
  onAuthChange(v: string): void { this.task().authId = v || undefined; }
  onUrlChange(v: string): void { this.task().url = v; }
  onMethodChange(v: string): void { this.task().method = v as HttpMethod; }
  onTimeoutChange(v: string): void { this.task().timeout = parseInt(v, 10) || 30; }
  onOutputKeyChange(v: string): void { this.task().outputKey = v; }
  onSampleResponseChange(v: string): void { this.task().sampleResponse = v; }
}