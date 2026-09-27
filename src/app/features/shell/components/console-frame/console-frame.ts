import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { SignalrService } from '../../../../core/services/signalr.service';
import { DemoService } from '../../../../core/services/demo.service';
import { ShellLayoutService } from '../../../../shared/services/shell-layout.service';
import { ConsoleSidebarComponent } from '../console-sidebar/console-sidebar';

@Component({
  selector: 'ei-console-frame',
  imports: [RouterOutlet, ConsoleSidebarComponent],
  templateUrl: './console-frame.html',
})
export class ConsoleFrameComponent {
  private readonly tenants = inject(TenantService);
  private readonly layout = inject(ShellLayoutService);
  private readonly demo = inject(DemoService);

  readonly signalr = inject(SignalrService);
  readonly activeTenants = this.tenants.activeTenants;
  readonly activeTenantId = this.tenants.activeTenantId;
  readonly sidebarCollapsed = this.layout.sidebarCollapsed;

  readonly demoStatus = this.demo.status;

  readonly startButtonLabel = computed(() => {
    switch (this.demoStatus()) {
      case 'running': return '⏸ Pause';
      case 'paused':  return '▶ Resume';
      default:        return '▶ Start Demo';
    }
  });

  readonly startButtonPrimary = computed(() => this.demoStatus() !== 'running');

  readonly livePillText = computed(() => {
    switch (this.demoStatus()) {
      case 'running': return 'Live';
      case 'paused':  return 'Paused';
      default:        return 'Idle';
    }
  });

  readonly livePillPaused = computed(() => this.demoStatus() !== 'running');

  onToggleSidebar(): void {
    this.layout.toggleSidebar();
  }

  onToggleDemo(): void {
    if (this.demoStatus() === 'running') this.demo.pause();
    else this.demo.start();
  }

  onReset(): void {
    this.demo.reset();
  }

  onTenantChange(id: string): void {
    this.tenants.switchTo(id);
  }
}