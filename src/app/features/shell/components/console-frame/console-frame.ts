import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { SignalrService } from '../../../../core/services/signalr.service';
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
  readonly signalr = inject(SignalrService);

  readonly activeTenants = this.tenants.activeTenants;
  readonly activeTenantId = this.tenants.activeTenantId;
  readonly sidebarCollapsed = this.layout.sidebarCollapsed;

  onToggleSidebar(): void {
    this.layout.toggleSidebar();
  }

  onTenantChange(id: string): void {
    this.tenants.switchTo(id);
  }
}