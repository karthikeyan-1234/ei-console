import { Injectable } from '@angular/core';
import { WatermarkApi } from '../watermark.api';
import { Watermark } from '../../models';
import { SEED_WATERMARKS } from './seed.data';

@Injectable()
export class FakeWatermarkApi extends WatermarkApi {
  private rows: Watermark[] = SEED_WATERMARKS.map(w => ({ ...w }));

  async list(): Promise<Watermark[]> {
    return this.rows.map(w => ({ ...w }));
  }

  async get(id: string): Promise<Watermark | undefined> {
    const w = this.rows.find(x => x.id === id);
    return w ? { ...w } : undefined;
  }

  async update(id: string, patch: Partial<Watermark>): Promise<Watermark> {
    const w = this.rows.find(x => x.id === id);
    if (!w) throw new Error(`Watermark not found: ${id}`);
    Object.assign(w, patch, { updatedAt: new Date().toLocaleString('en-GB') });
    return { ...w };
  }
}