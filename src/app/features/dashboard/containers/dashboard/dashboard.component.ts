import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { DashboardFacadeService } from '../../facades/dashboard.facade.service';
import DashboardItemComponent from '../../components/dashboard-item/dashboard-item.component';
import { Status, StatusTypes } from '../../../tasks/models/task';

interface ViewModel {
  title: string;
  status: StatusTypes;
  percentage: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardItemComponent, MatProgressSpinner, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent {
  readonly #facade = inject(DashboardFacadeService);

  viewModel: Signal<ViewModel[]> = computed(() => [
    {
      title: 'Todo',
      percentage: this.#facade.todoPercentage(),
      status: Status.todo,
    },
    {
      title: 'In progress',
      percentage: this.#facade.inProgressPercentage(),
      status: Status.inProgress,
    },
    {
      title: 'Done',
      percentage: this.#facade.donePercentage(),
      status: Status.done,
    },
  ]);
}
