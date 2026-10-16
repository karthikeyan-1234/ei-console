import { Component, inject } from '@angular/core';

import { ConsoleFrameComponent } from './components/console-frame/console-frame';
import {
  RateLimitService,
  WatermarkService,
  DlqService,
  ExecutionService,
  ScatterGatherService,
  AuthProfileService,
} from '../../core/services';
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
  private readonly executions = inject(ExecutionService);
  private readonly scatter = inject(ScatterGatherService);

  // Injected for their sidebar badge computed signals, but not loaded —
  // their backends don't exist. Kept here so re-enabling is one line each.
  private readonly rateLimits = inject(RateLimitService);
  private readonly watermarks = inject(WatermarkService);
  private readonly dlq = inject(DlqService);
  private readonly storedCreds = inject(StoredCredentialService);
  private readonly chat = inject(ChatService);

  constructor() {
    void this.boot();
  }

  private async boot(): Promise<void> {
    // Tenants first — the tenant selector needs them.
    try {
      await this.tenants.load();
    } catch (e) {
      console.warn('[shell.boot] tenants load failed:', e);
    }

    // Everything else in parallel. allSettled waits for every promise and
    // never rejects, so one 404 cannot take down the shell.
    await Promise.allSettled([
      this.jobs.load(),
      this.connections.load(),
      this.auth.load(),
      this.executions.load(),
    ]);

    // Standalone demo — no backend, safe to always reset.
    this.scatter.reset();
  }
}