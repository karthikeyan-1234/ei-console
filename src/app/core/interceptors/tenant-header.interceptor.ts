import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

/**
 * Attaches the active tenant code to every outgoing request as `X-Tenant-Code`.
 * This is what the .NET 10 backend will read to resolve the tenant scope on
 * each controller action. It is a no-op while the fake APIs are in use, because
 * the fakes never touch HttpClient.
 */
export const tenantHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = inject(TenantService).activeTenantId();
  if (!tenantId) return next(req);
  return next(
    req.clone({ setHeaders: { 'X-Tenant-Code': tenantId } }),
  );
};