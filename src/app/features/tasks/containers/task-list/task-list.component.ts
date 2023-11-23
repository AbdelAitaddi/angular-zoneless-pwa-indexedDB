import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import TaskListDragDropComponent from '../../components/task-drag-drop-list/task-list-drag-drop.component';
import { TasksFacadeService } from '../../facades/tasks.facade.service';
import { Task } from '../../models/task';
import { SyncAction } from '../../services/task-database.service';
import { MatTooltip } from '@angular/material/tooltip';

interface ViewModel {
  tasks: Task[];
  syncQueue: SyncAction[];
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskListDragDropComponent, MatIcon, MatButton, MatProgressSpinner, MatTooltip],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TaskListComponent {
  readonly #facade = inject(TasksFacadeService);

  viewModel: Signal<ViewModel> = computed(() => ({
    syncQueue: this.#facade.syncQueue(),
    tasks: this.#facade.tasks(),
  }));

  addTask() {
    this.#facade.addTask();
  }

  moveTask(task: Task) {
    this.#facade.moveTask(task);
  }

  editTask(task: Task) {
    this.#facade.selectTask(task);
  }

  deleteTask(task: Task) {
    this.#facade.deleteTask(task);
  }

  undoDeleteTask(id: number) {
    this.#facade.undoDeleteTaskOffline(id);
  }
}
