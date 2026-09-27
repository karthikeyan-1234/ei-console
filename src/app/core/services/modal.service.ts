import { Injectable, signal } from '@angular/core';
import { AuthProfile, Connection, RateLimit, Tenant } from '../models';

export type ModalId =
  | 'modalTenant'
  | 'modalConnection'
  | 'modalAuth'
  | 'modalRate'
  | 'modalCreateJob'
  | 'modalTask';

@Injectable({ providedIn: 'root' })
export class ModalService {
  /** Currently open modal, if any. `null` means nothing is open. */
  private readonly _openId = signal<ModalId | null>(null);
  readonly openId = this._openId.asReadonly();

  // Editing context — one slot per resource that has an "edit existing" mode.
  readonly editingTenantId = signal<string | null>(null);
  readonly editingConnectionId = signal<string | null>(null);
  readonly editingAuthId = signal<string | null>(null);
  readonly editingRateId = signal<string | null>(null);

  // Snapshot of the entity being edited, if the caller wants to pre-fill a form.
  readonly editingTenant = signal<Tenant | null>(null);
  readonly editingConnection = signal<Connection | null>(null);
  readonly editingAuth = signal<AuthProfile | null>(null);
  readonly editingRate = signal<RateLimit | null>(null);

  open(id: ModalId): void { this._openId.set(id); }
  close(): void { this._openId.set(null); }

  isOpen(id: ModalId): boolean { return this._openId() === id; }

  openTenantModal(tenant: Tenant | null = null): void {
    this.editingTenantId.set(tenant?.id ?? null);
    this.editingTenant.set(tenant);
    this.open('modalTenant');
  }

  openConnectionModal(connection: Connection | null = null): void {
    this.editingConnectionId.set(connection?.id ?? null);
    this.editingConnection.set(connection);
    this.open('modalConnection');
  }

  openAuthModal(auth: AuthProfile | null = null): void {
    this.editingAuthId.set(auth?.id ?? null);
    this.editingAuth.set(auth);
    this.open('modalAuth');
  }

  openRateModal(rate: RateLimit | null = null): void {
    this.editingRateId.set(rate?.id ?? null);
    this.editingRate.set(rate);
    this.open('modalRate');
  }

  openCreateJobModal(): void {
    this.open('modalCreateJob');
  }

  openTaskModal(): void {
    this.open('modalTask');
  }
}