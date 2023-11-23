import { computed, inject, Injectable } from '@angular/core';
import { TasksFacadeService } from '../../tasks/facades/tasks.facade.service';
import { Status, StatusTypes } from '../../tasks/models/task';

@Injectable({
  providedIn: 'root',
})
export class DashboardFacadeService {
  #tasksFacade = inject(TasksFacadeService);

  todoPercentage = this.#calculatePercentage(Status.todo);
  inProgressPercentage = this.#calculatePercentage(Status.inProgress);
  donePercentage = this.#calculatePercentage(Status.done);

  #calculatePercentage(status: StatusTypes) {
    return computed(() => {
      const allTasks = this.#tasksFacade.tasks();
      const selectedTasksCount = allTasks.filter((task) => task.status === status).length;

      return allTasks.length ? Math.round((selectedTasksCount / allTasks.length) * 100) : 0;
    });
  }
}
