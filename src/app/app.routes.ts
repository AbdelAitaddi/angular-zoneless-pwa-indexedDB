import {
  PreloadAllModules,
  provideRouter,
  Routes,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => 'tasks',
  },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.routes'),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes'),
  },
  {
    path: '**',
    loadComponent: () => import('./core/no-layout/not-found.component'),
  },
];

export function provideRouterConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
      }),
    ),
  ]);
}
