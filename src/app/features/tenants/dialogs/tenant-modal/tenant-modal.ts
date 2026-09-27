import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { Tenant } from '../../../../core/models';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';

export interface TenantSaveEvent {
  tenant: Tenant;
  patch: Partial<Tenant>;
  isNew: boolean;
}

@Component({
  selector: 'ei-tenant-modal',
  imports: [ModalShellComponent],
  templateUrl: './tenant-modal.html',
})
export class TenantModalComponent implements OnInit {
  readonly tenant = input<Tenant | null>(null);

  readonly saved = output<TenantSaveEvent>();
  readonly cancelled = output<void>();

  readonly code = signal('');
  readonly name = signal('');
  readonly coreUrl = signal('');
  readonly coreDbRef = signal('');
  readonly active = signal(true);
  readonly error = signal<string | null>(null);

  readonly isEdit = computed(() => this.tenant() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit Tenant' : 'New Tenant'));
  readonly subtitle = computed(() =>
    this.isEdit() ? 'Update tenant configuration' : 'Register a new tenant',
  );

  ngOnInit(): void {
    const t = this.tenant();
    if (t) {
      this.code.set(t.code);
      this.name.set(t.name);
      this.coreUrl.set(t.coreUrl);
      this.coreDbRef.set(t.coreDbRef ?? '');
      this.active.set(t.active);
    }
  }

  onCodeInput(v: string): void { this.code.set(v); }
  onNameInput(v: string): void { this.name.set(v); }
  onCoreUrlInput(v: string): void { this.coreUrl.set(v); }
  onCoreDbRefInput(v: string): void { this.coreDbRef.set(v); }
  onActiveInput(v: string): void { this.active.set(v === '1'); }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSave(): void {
    this.error.set(null);

    const name = this.name().trim();
    if (!name) { this.error.set('Name required'); return; }

    const t = this.tenant();
    if (t) {
      // Edit mode — id and code are fixed
      this.saved.emit({
        tenant: t,
        patch: {
          name,
          coreUrl: this.coreUrl().trim(),
          coreDbRef: this.coreDbRef().trim(),
          active: this.active(),
        },
        isNew: false,
      });
      return;
    }

    // Create mode
    const code = this.code().trim().toLowerCase();
    if (!code) { this.error.set('Code required'); return; }
    if (!/^[a-z0-9-]+$/.test(code)) {
      this.error.set('Lowercase alphanumeric + hyphens only');
      return;
    }

    const coreUrl = this.coreUrl().trim() ||
      `https://core-${code}.insureliv.com/api/v2`;

    this.saved.emit({
      tenant: {
        id: code,
        code,
        name,
        coreUrl,
        coreDbRef: this.coreDbRef().trim(),
        active: this.active(),
      },
      patch: {},
      isNew: true,
    });
  }
}