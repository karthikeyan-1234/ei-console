import { Component, computed, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Job, TriggerType } from '../../../../core/models';
import { JobService } from '../../../../core/services/job.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell';
import { slugify } from '../../../../core/utils/string.util';
import { nowLong } from '../../../../core/utils/date.util';

@Component({
  selector: 'ei-create-job-modal',
  imports: [ModalShellComponent],
  templateUrl: './create-job-modal.html',
})
export class CreateJobModalComponent {
  private readonly jobs = inject(JobService);
  private readonly tenants = inject(TenantService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  readonly saved = output<Job>();
  readonly cancelled = output<void>();

  readonly activeTenants = this.tenants.activeTenants;

  readonly name = signal('');
  readonly slug = signal('');
  readonly tenant = signal(this.tenants.activeTenantId());
  readonly trigger = signal<TriggerType>('Scheduled');
  readonly cron = signal('0 */15 * * * *');
  readonly description = signal('');
  readonly error = signal<string | null>(null);

  private slugEdited = false;

  readonly shownSlug = computed(() =>
    slugify(this.slug().trim() || this.name()),
  );

  readonly slugConflicts = computed(() =>
    !!this.shownSlug() && this.jobs.slugConflict(this.tenant(), this.shownSlug()),
  );

  onNameInput(value: string): void {
    this.name.set(value);
    if (!this.slugEdited) this.slug.set(slugify(value));
  }

  onSlugInput(value: string): void {
    this.slugEdited = true;
    this.slug.set(value);
  }

  onTenantInput(value: string): void { this.tenant.set(value); }
  onTriggerInput(value: string): void { this.trigger.set(value as TriggerType); }
  onCronInput(value: string): void { this.cron.set(value); }
  onDescriptionInput(value: string): void { this.description.set(value); }

  onCancel(): void {
    this.cancelled.emit();
  }

  async onSave(): Promise<void> {
    this.error.set(null);

    const name = this.name().trim();
    if (!name) { this.error.set('Job name is required.'); return; }

    const slug = slugify(this.slug().trim() || name);
    if (!slug) { this.error.set('Slug needs at least one letter or digit.'); return; }

    const trigger = this.trigger();
    const cron = this.cron().trim();
    if (trigger === 'Scheduled') {
      const fieldCount = cron.split(/\s+/).filter(Boolean).length;
      if (fieldCount < 6 || fieldCount > 7) {
        this.error.set('Quartz CRON needs 6 or 7 fields.');
        return;
      }
    }

    if (this.jobs.slugConflict(this.tenant(), slug)) {
      this.error.set(`Slug "${slug}" already exists for ${this.tenants.labelFor(this.tenant())}.`);
      return;
    }

    const created = await this.jobs.create({
      name,
      slug,
      tenant: this.tenant(),
      status: 'Draft',
      trigger,
      cron: trigger === 'Scheduled' ? cron : '—',
      created: nowLong(),
      lastRun: '—',
      next: 'Publish to activate',
      description: this.description().trim(),
      version: 0,
      publishedAt: '—',
      publishedBy: '—',
      pipeline: [],
    });

    // Switch the active tenant if the new job belongs to a different one.
    if (created.tenant !== this.tenants.activeTenantId()) {
      this.tenants.switchTo(created.tenant);
    }

    this.toasts.success(`Job "${created.name}" created as a draft`);
    this.saved.emit(created);
    void this.router.navigate(['/console/builder'], {
      queryParams: { jobId: created.id },
    });
  }
}