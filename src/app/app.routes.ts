import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'console/jobs', pathMatch: 'full' },
  {
    path: 'console',
    loadChildren: () =>
      import('./features/shell/shell.routes').then(m => m.SHELL_ROUTES),
  },
  { path: '**', redirectTo: 'console/jobs' },
];