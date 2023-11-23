import { ChangeDetectionStrategy, Component, computed, input, output, Signal } from '@angular/core';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';

import { Status, StatusTypes, Task } from '../../models/task';
import { SyncAction } from '../../services/task-database.service';

import TaskItemComponent from '../task-item/task-item.component';

export const getFilterTasksByStatus = (tasks: Task[], status: StatusTypes) =>
  tasks.filter((item) => item.status === status);

export const taskInOutAnimation = trigger('taskInOutTrigger', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, backgroundColor: '#fdd835', transform: 'scale(0.5)' }),
        stagger(100, [animate('500ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))]),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        style({ opacity: 1, color: '#ffffff', backgroundColor: '#d32f2f', transform: 'scale(1)' }),
        stagger(-100, [animate('500ms ease-out', style({ opacity: 0, transform: 'scale(0.5)' }))]),
      ],
      { optional: true },
    ),
  ]),
]);

export const taskHeadlineAnimation = trigger('taskHeadlineTrigger', [
  transition(':enter', [style({ width: '10px', opacity: 0 }), animate('0.7s', style({ width: '100%', opacity: 1 }))]),
  transition(':leave', [animate('1s', style({ opacity: 0 }))]),
]);

export interface SyncActionStatus {
  created: SyncAction | null;
  updated: SyncAction | null;
  deleted: SyncAction | null;
}

@Component({
  selector: 'app-task-list-drag-drop',
  standalone: true,
  templateUrl: 'task-list-drag-drop.component.html',
  styleUrl: 'task-list-drag-drop.component.scss',
  imports: [CdkDropListGroup, CdkDropList, MatButtonModule, TaskItemComponent, CdkDrag],
  animations: [taskInOutAnimation, taskHeadlineAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TaskListDragDropComponent {
  moveTask = output<Task>();
  editTask = output<Task>();
  deleteTask = output<Task>();
  undoDeleteTask = output<number>();

  tasks = input<Task[]>([]);
  syncQueue = input<SyncAction[]>([]);

  tasksByStatus = computed(() => [
    {
      title: 'To do',
      status: Status.todo,
      tasks: getFilterTasksByStatus(this.tasks(), Status.todo) ?? [],
    },
    {
      title: 'in progress',
      status: Status.inProgress,
      tasks: getFilterTasksByStatus(this.tasks(), Status.inProgress) ?? [],
    },
    {
      title: 'Done',
      status: Status.done,
      tasks: getFilterTasksByStatus(this.tasks(), Status.done) ?? [],
    },
  ]);

  move(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const updatedTask: Task = {
        ...event.item.data,
        status: event.container.id as StatusTypes,
      };
      this.moveTask.emit(updatedTask);
    }
  }

  getSyncActionsByTaskId(id: number): SyncActionStatus {
    const syncActions = this.#groupedSyncQueue()[id] || [];

    return {
      created: syncActions.length ? syncActions.filter((item) => item.type === 'ADD')?.[0] : null,
      updated: syncActions.length ? syncActions.filter((item) => item.type === 'UPDATE')?.[0] : null,
      deleted: syncActions.length ? syncActions.filter((item) => item.type === 'DELETE')?.[0] : null,
    };
  }

  #groupedSyncQueue: Signal<Record<number, SyncAction[]>> = computed(() => {
    return this.syncQueue().reduce(
      (syncActions, action) => {
        if (!syncActions[action.taskId]) {
          syncActions[action.taskId] = [];
        }
        syncActions[action.taskId].push(action);
        return syncActions;
      },
      {} as Record<number, SyncAction[]>,
    );
  });
}
