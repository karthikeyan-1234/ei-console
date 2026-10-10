import { Routes } from '@angular/router';
import { ShellComponent } from './shell';

export const SHELL_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'jobs', pathMatch: 'full' },

      {
        path: 'jobs',
        loadComponent: () =>
          import('../jobs/views/jobs-view/jobs-view').then(m => m.JobsViewComponent),
      },
      {
        path: 'executions',
        loadComponent: () =>
          import('../executions/views/executions-view/executions-view').then(m => m.ExecutionsViewComponent),
      },
      {
        path: 'executions/:id',
        loadComponent: () =>
          import('../executions/views/execution-detail-view/execution-detail-view').then(m => m.ExecutionDetailViewComponent),
      },
      {
        path: 'scatter',
        loadComponent: () =>
          import('../scatter-gather/views/scatter-gather-view/scatter-gather-view').then(m => m.ScatterGatherViewComponent),
      },
      {
        path: 'dlq',
        loadComponent: () =>
          import('../dlq/views/dlq-view/dlq-view').then(m => m.DlqViewComponent),
      },
      {
        path: 'tenants',
        loadComponent: () =>
          import('../tenants/views/tenants-view/tenants-view').then(m => m.TenantsViewComponent),
      },
      {
        path: 'connections',
        loadComponent: () =>
          import('../connections/views/connections-view/connections-view').then(m => m.ConnectionsViewComponent),
      },
      {
        path: 'auth',
        loadComponent: () =>
          import('../auth-profiles/views/auth-profiles-view/auth-profiles-view').then(m => m.AuthProfilesViewComponent),
      },
      {
        path: 'rate',
        loadComponent: () =>
          import('../rate-limits/views/rate-limits-view/rate-limits-view').then(m => m.RateLimitsViewComponent),
      },
      {
        path: 'watermarks',
        loadComponent: () =>
          import('../watermarks/views/watermarks-view/watermarks-view').then(m => m.WatermarksViewComponent),
      },
      {
        path: 'builder',
        loadComponent: () =>
          import('../builder/views/builder-view/builder-view').then(m => m.BuilderViewComponent),
      },
      {
        path: 'credentials',
        loadComponent: () =>
          import('../credentials/views/credentials-view/credentials-view').then(
            m => m.CredentialsViewComponent,
          ),
      },
    ],
  },
];