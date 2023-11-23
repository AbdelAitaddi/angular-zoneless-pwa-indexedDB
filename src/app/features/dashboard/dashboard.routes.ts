import { Routes } from '@angular/router';

const dashboardRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Dashboard',
    loadComponent: () => import('./containers/dashboard/dashboard.component'),
  },
];

export default dashboardRoutes;
