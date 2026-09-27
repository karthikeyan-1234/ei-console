import { Component, input, output } from '@angular/core';
import { Tenant } from '../../../../core/models';

export interface TenantCounts {
  jobs: number;
  conns: number;
  auths: number;
  wms: number;
}

@Component({
  selector: 'ei-tenant-card',
  imports: [],
  templateUrl: './tenant-card.html',
})
export class TenantCardComponent {
  readonly tenant = input.required<Tenant>();
  readonly counts = input.required<TenantCounts>();
  readonly isActive = input.required<boolean>();

  readonly switched = output<string>();
  readonly edited = output<string>();
  readonly deleted = output<string>();

  onSwitch(): void { this.switched.emit(this.tenant().id); }
  onEdit(): void { this.edited.emit(this.tenant().id); }
  onDelete(): void { this.deleted.emit(this.tenant().id); }
}