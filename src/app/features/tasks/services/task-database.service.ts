import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

import { Task } from '../models/task';
import { SyncActionType } from '../models/action';

export interface SyncAction {
  id?: number;
  type: SyncActionType;
  taskId: number;
}

export type TaskDB = Omit<Task, 'id'> & {
  id?: number;
};

export const dbName = 'taskly-db-app';

export const dbVersion = 5;
@Injectable({
  providedIn: 'root',
})
export class TaskDatabaseService extends Dexie {
  tasks!: Table<TaskDB, number>;
  syncQueue!: Table<SyncAction, number>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  meta!: Dexie.Table<{ key: string; value: any }, string>;

  constructor() {
    super(dbName);
    this.#createDatabase();
  }

  #createDatabase() {
    this.version(dbVersion).stores({
      tasks: '++id, updatedAt',
      syncQueue: '++id, taskId, type, [taskId+type]',
      meta: '&key',
    });

    this.tasks = this.table('tasks');
    this.syncQueue = this.table('syncQueue');
    this.meta = this.table('meta');
  }

  async addTask(task: TaskDB) {
    await this.tasks.add(task);
  }

  async updateTask(task: Task) {
    await this.tasks.put(task);
  }

  async deleteTask(id: number) {
    await this.tasks.delete(id);
  }

  async addTaskOffline(task: TaskDB, action: SyncActionType) {
    const existingTask = await this.syncQueue.where({ taskId: task.id, type: action }).first();
    if (!existingTask) {
      await this.syncQueue.add({ type: action, taskId: task.id! });
    }
  }

  async updateTaskOffline(task: TaskDB, action: SyncActionType) {
    const changes = { taskId: task.id!, type: action };
    const existingTask = await this.syncQueue.where(changes).first();

    await this.syncQueue.put(existingTask ? { ...existingTask, ...changes } : changes);
  }

  async deleteTaskOffline(id: number) {
    await this.syncQueue.delete(id);
  }
}
