import { Component, inject } from '@angular/core';

import { ConsoleFrameComponent } from './components/console-frame/console-frame';
import { RateLimitService,  WatermarkService, DlqService, ExecutionService, ScatterGatherService, AuthProfileService } from '../../core/services';
import { TenantService } from '../../core/services/tenant.service';
import { ConnectionService } from '../../core/services';
import { JobService } from '../../core/services/job.service';
import { StoredCredentialService } from '../../core/services/stored-credential.service';

import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'ei-shell',
  imports: [ConsoleFrameComponent],
  templateUrl: './shell.html',
})
export class ShellComponent {
  private readonly tenants = inject(TenantService);
  private readonly jobs = inject(JobService);
  private readonly connections = inject(ConnectionService);
  private readonly auth = inject(AuthProfileService);
  private readonly rateLimits = inject(RateLimitService);
  private readonly watermarks = inject(WatermarkService);
  private readonly executions = inject(ExecutionService);
  private readonly dlq = inject(DlqService);
  private readonly scatter = inject(ScatterGatherService);
    private readonly storedCreds = inject(StoredCredentialService);
    private readonly chat = inject(ChatService);

  constructor() {
    void this.boot();
  }

private async boot(): Promise<void> {
  await this.tenants.load();

await Promise.all([
  this.jobs.load(),
  this.connections.load(),
  this.auth.load(),
  this.rateLimits.load(),
  this.watermarks.load(),
  this.executions.load(),
  this.dlq.load(),
  this.storedCreds.load(),
  this.chat.load(),
]);

  this.scatter.reset();
}
}