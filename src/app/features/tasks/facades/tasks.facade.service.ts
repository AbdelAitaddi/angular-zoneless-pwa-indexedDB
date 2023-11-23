import { effect, inject, Injectable, signal, Signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, tap, throwError } from 'rxjs';
import { liveQuery } from 'dexie';

import DeleteDialogComponent from '../components/delete-dialog/delete-dialog.component';

import { TasksService } from '../services/tasks.service';
import { NewTask, Status, Task } from '../models/task';
import { isTask } from '../helpers/task-hepers';

import { TaskDatabaseService, SyncAction } from '../services/task-database.service';
import { SyncTaskHandlerService } from '../services/sync-task-handler.service';
import { Action } from '../models/action';
import TaskFormDialogComponent from '../components/task-form-dialog/task-form-dialog.component';
import { NetworkService } from '../../../core/services/network.service';

@Injectable({
  providedIn: 'root',
})
export class TasksFacadeService {
  #dialog = inject(MatDialog);
  #snackBar = inject(MatSnackBar);
  #appDatabase = inject(TaskDatabaseService);
  #tasksService = inject(TasksService);
  #network = inject(NetworkService);
  #syncService = inject(SyncTaskHandlerService);

  //  initial task collection from indexedDB.
  tasks = toSignal(
    liveQuery(async () => (await this.#appDatabase.tasks.toArray()) as Task[]),
    { initialValue: [] },
  ) as Signal<Task[]>;

  syncQueue = toSignal(
    liveQuery(async () => (await this.#appDatabase.syncQueue.toArray()) as SyncAction[]),
    { initialValue: [] },
  ) as Signal<SyncAction[]>;

  #addTaskData = signal<NewTask | undefined>(undefined);
  /* eslint-disable  no-unused-private-class-members */
  #addTaskResource = rxResource<Task, NewTask>({
    request: () => this.#addTaskData() as NewTask,
    loader: ({ request: newTask }) =>
      this.#tasksService.addTask(newTask).pipe(
        tap({
          next: async (task: Task) => {
            await this.#appDatabase.addTask(task);
            const message = `The task ${task.title} has been created.`;
            this.#snackBar.open(message, 'Close', { duration: 2_000, panelClass: 'success' });
          },
        }),
        catchError((err) =>
          throwError(async () => {
            if (!this.#network.online()) {
              await this.#appDatabase.addTask(newTask);
              await this.#appDatabase.addTaskOffline(newTask, Action.ADD);
            } else {
              this.#snackBar.open(err.message, 'Close', { panelClass: 'error' });
            }
            return EMPTY;
          }),
        ),
      ),
  });

  #updateTaskData = signal<Task | undefined>(undefined);
  #updateTaskResource = rxResource<Task, Task>({
    request: () => this.#updateTaskData() as Task,
    loader: ({ request }) =>
      this.#tasksService.updateTask(request).pipe(
        tap(async (task: Task) => {
          await this.#appDatabase.updateTask(task);
          const message = `The task ${task.title} has been updated.`;
          this.#snackBar.open(message, 'Close', { duration: 2_000, panelClass: 'success' });
        }),
        catchError((err) =>
          throwError(async () => {
            if (!this.#network.online()) {
              await this.#appDatabase.updateTask(request);
              await this.#appDatabase.updateTaskOffline(request, Action.UPDATE);
            } else {
              this.#snackBar.open(err.message, 'Close', { panelClass: 'error' });
            }
            return EMPTY;
          }),
        ),
      ),
  });

  #deleteTaskData = signal<Task | undefined>(undefined);
  #deleteTaskResource = rxResource<Task, Task>({
    request: () => this.#deleteTaskData() as Task,
    loader: ({ request }) => {
      return this.#tasksService.deleteTask(request).pipe(
        tap(async (task: Task) => {
          await this.#appDatabase.deleteTask(task.id);
          const message = `The task ${task.title} has been deleted.`;
          this.#snackBar.open(message, 'Close', { duration: 2_000, panelClass: 'success' });
        }),
        catchError((err) =>
          throwError(async () => {
            if (!this.#network.online()) {
              await this.#appDatabase.addTaskOffline(request, Action.DELETE);
            } else {
              this.#snackBar.open(err.message, 'Close', { panelClass: 'error' });
            }
            return EMPTY;
          }),
        ),
      );
    },
  });

  constructor() {
    effect(async () => {
      if (this.#network.online()) {
        await this.#syncService.SyncTasksWithServer();
        await this.#syncService.syncPendingTasksWithServer();
      }
    });
  }

  addTask() {
    this.selectTask({ title: '', status: Status.todo, updatedAt: Date.now() });
  }

  moveTask(updatedTask: Task) {
    this.#updateTaskData.set({ ...updatedTask });
  }

  selectTask(task: Task | NewTask) {
    const dialogConfig: MatDialogConfig<Task | NewTask> = {
      id: 'form-container',
      width: '400px',
      autoFocus: true,
      disableClose: false,
      enterAnimationDuration: '400ms',
      exitAnimationDuration: '400ms',
      data: task,
    };

    this.#dialog
      .open<TaskFormDialogComponent, Task | NewTask, Task | NewTask>(TaskFormDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe({
        next: (data) => {
          if (data) {
            if (isTask(data)) {
              this.#updateTaskData.set({ ...data });
            } else {
              this.#addTaskData.set({ ...data });
            }
          }
        },
      });
  }

  deleteTask(task: Task) {
    const dialogConfig: MatDialogConfig<Task> = {
      id: 'delete-container',
      width: '400px',
      autoFocus: true,
      disableClose: true,
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
      data: { ...task },
    };

    this.#dialog
      .open(DeleteDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe({
        next: (data: Task | undefined) => {
          if (data) {
            this.#deleteTaskData.set({ ...data });
          }
        },
      });
  }

  async undoDeleteTaskOffline(sycActionId: number) {
    await this.#appDatabase.deleteTaskOffline(sycActionId);
  }
}
