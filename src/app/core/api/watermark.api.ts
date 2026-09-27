import { InjectionToken } from '@angular/core';
import { Watermark } from '../models';

export abstract class WatermarkApi {
  abstract list(): Promise<Watermark[]>;
  abstract get(id: string): Promise<Watermark | undefined>;
  abstract update(id: string, patch: Partial<Watermark>): Promise<Watermark>;
}

export const WATERMARK_API = new InjectionToken<WatermarkApi>('WATERMARK_API');