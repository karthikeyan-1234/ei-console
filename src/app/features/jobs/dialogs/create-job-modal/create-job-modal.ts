import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
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

  /**
   * When non-null, the modal opens in edit mode for this job. When null, it
   * opens in create mode. The component name still says "create" for
   * historical reasons — it handles both flows now.
   */
  readonly editing = input<Job | null>(null);

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

  readonly isEdit = computed(() => this.editing() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit Job' : 'Create Job'));
  readonly subtitle = computed(() =>
    this.isEdit()
      ? 'Update the job identity and schedule. Tasks are edited in Job Builder.'
      : 'Register identity. Tasks are added in Job Builder.',
  );
  readonly saveLabel = computed(() =>
    this.isEdit() ? 'Save Changes' : 'Create Job & open in Builder →',
  );

  readonly shownSlug = computed(() =>
    slugify(this.slug().trim() || this.name()),
  );

  readonly slugConflicts = computed(() => {
    const shown = this.shownSlug();
    if (!shown) return false;
    // When editing, exclude the job being edited from the uniqueness check.
    return this.jobs.slugConflict(this.tenant(), shown, this.editing()?.id);
  });

  constructor() {
    effect(() => {
      const job = this.editing();
      if (job) {
        this.name.set(job.name);
        this.slug.set(job.slug);
        this.tenant.set(job.tenant);
        this.trigger.set(job.trigger);
        this.cron.set(job.cron === '—' ? '0 */15 * * * *' : job.cron);
        this.description.set(job.description ?? '');
        this.slugEdited = true;
        this.error.set(null);
      } else {
        // Reset to defaults for a fresh create.
        this.name.set('');
        this.slug.set('');
        this.tenant.set(this.tenants.activeTenantId());
        this.trigger.set('Scheduled');
        this.cron.set('0 */15 * * * *');
        this.description.set('');
        this.slugEdited = false;
        this.error.set(null);
      }
    });
  }

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

    if (this.jobs.slugConflict(this.tenant(), slug, this.editing()?.id)) {
      this.error.set(`Slug "${slug}" already exists for ${this.tenants.labelFor(this.tenant())}.`);
      return;
    }

    if (this.isEdit()) {
      const job = this.editing()!;
      const updated = await this.jobs.update(job.id, {
        name,
        trigger,
        cron: trigger === 'Scheduled' ? cron : '—',
        description: this.description().trim(),
      });
      this.toasts.success(`Job "${updated.name}" updated`);
      this.saved.emit(updated);
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