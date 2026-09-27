import { Injectable, signal } from '@angular/core';

/**
 * Holds layout state that spans the topbar and the console frame.
 * Today only the sidebar collapse flag; future additions (theme, density)
 * belong here too.
 */
@Injectable({ providedIn: 'root' })
export class ShellLayoutService {
  private readonly _sidebarCollapsed = signal(false);
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  toggleSidebar(): void {
    this._sidebarCollapsed.update(v => !v);
  }
}