export type RateLimitScope = 'PerConnection' | 'PerTenant' | 'Global';

export interface RateLimit {
  id: string;
  connectionId: string;
  scope: RateLimitScope;
  rps: number;
  burst: number;
  concurrent: number;
}