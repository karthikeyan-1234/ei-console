import { InjectionToken } from '@angular/core';
import { ScatterItem } from '../models';

export abstract class ScatterItemApi {
  abstract list(executionId: string): Promise<ScatterItem[]>;
  abstract replay(executionId: string, itemId: string): Promise<ScatterItem>;
}

export const SCATTER_ITEM_API = new InjectionToken<ScatterItemApi>('SCATTER_ITEM_API');