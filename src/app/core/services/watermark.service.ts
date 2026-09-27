import { Injectable, computed, inject, signal } from '@angular/core';
import { WATERMARK_API, WatermarkApi } from '../api/watermark.api';
import { Watermark } from '../models';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class WatermarkService {
  private api = inject<WatermarkApi>(WATERMARK_API);
  private tenants = inject(TenantService);

  private readonly _watermarks = signal<Watermark[]>([]);
  readonly watermarks = this._watermarks.asReadonly();

  readonly scopedWatermarks = computed(() =>
    this._watermarks().filter(w => w.tenant === this.tenants.activeTenantId()),
  );

  async load(): Promise<void> {
    this._watermarks.set(await this.api.list());
  }

  async update(id: string, patch: Partial<Watermark>): Promise<Watermark> {
    const updated = await this.api.update(id, patch);
    this._watermarks.update(rows => rows.map(w => (w.id === id ? updated : w)));
    return updated;
  }
}