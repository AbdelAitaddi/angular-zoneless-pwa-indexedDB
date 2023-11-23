import { Routes } from '@angular/router';

const tasksRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Tasks overview',
    loadComponent: () => import('./containers/task-list/task-list.component'),
  },
];

export default tasksRoutes;
