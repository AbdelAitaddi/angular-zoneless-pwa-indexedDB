import { inject, Injectable } from '@angular/core';
import { TaskDatabaseService, SyncAction, TaskDB } from './task-database.service';
import { catchError, EMPTY, firstValueFrom, tap } from 'rxjs';
import { Task } from '../models/task';
import { TasksService } from './tasks.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '../models/action';

@Injectable({ providedIn: 'root' })
export class SyncTaskHandlerService {
  #snackBar = inject(MatSnackBar);
  #tasksService = inject(TasksService);
  #appDatabase = inject(TaskDatabaseService);

  // Synchronisiert alle ausstehenden Aufgaben mit dem Server
  async syncPendingTasksWithServer() {
    const syncActions: SyncAction[] = (await this.#appDatabase.syncQueue.toArray()).sort((a, b) => {
      // 'delete' soll als letztes kommen
      if (a.type === Action.DELETE && b.type !== Action.DELETE) return 1;
      if (a.type !== Action.DELETE && b.type === Action.DELETE) return -1;
      return 1;
    }) as SyncAction[];

    for (const action of syncActions) {
      const taskDB = await this.#appDatabase.tasks.where({ id: action.taskId }).first();
      if (taskDB) {
        switch (action.type) {
          case Action.ADD:
            await this.#addTask(taskDB, action);
            break;

          case Action.UPDATE:
            await this.#updateTask(taskDB, action);
            break;

          case Action.DELETE:
            await this.#deleteTask(taskDB, action);
            break;
        }
      } else {
        // Falls die Aufgabe nicht existiert, wird sie aus der Sync-Queue entfernt
        await this.#appDatabase.syncQueue.delete(action.id!);
      }
    }
  }

  // Synchronisiert die Aufgaben mit dem Server
  async SyncTasksWithServer() {
    // Letzten Synchronisationszeitpunkt aus der lokalen Datenbank abrufen
    const lastSync = (await this.#appDatabase.meta.get('lastSync'))?.value || 0;
    // Nur neue oder aktualisierte Aufgaben vom Server abrufen
    const serverTasks = await firstValueFrom(this.#tasksService.getTasks(lastSync));

    if (serverTasks.length > 0) {
      // Aufgaben in IndexedDB speichern (existierende aktualisieren, neue hinzufügen)
      await this.#appDatabase.tasks.bulkPut(serverTasks);
      // Neuen Synchronisationszeitpunkt speichern
      await this.#appDatabase.meta.put({ key: 'lastSync', value: Date.now() });
    }
  }

  // Fügt eine neue Aufgabe auf dem Server hinzu
  async #addTask(taskDB: TaskDB, action: SyncAction) {
    try {
      const { id, ...payload } = taskDB;
      await firstValueFrom(
        this.#tasksService.addTask(payload).pipe(
          tap(async (task) => {
            // Lokale Aufgabe löschen und durch die vom Server bestätigte ersetzen
            await this.#appDatabase.deleteTask(id!);
            await this.#appDatabase.addTask(task);
            await this.#appDatabase.deleteTaskOffline(action.id!);
          }),
        ),
      );
    } catch (error) {
      // Fehlermeldung anzeigen, falls die Synchronisation fehlschlägt
      const message = `Sync local fehlgeschlagen, versuche später erneut: (${(error as HttpErrorResponse).message})`;
      this.#snackBar.open(message, 'Close', { panelClass: 'error' });
    }
  }

  // Aktualisiert eine bestehende Aufgabe auf dem Server
  async #updateTask(taskDB: TaskDB, action: SyncAction) {
    try {
      await firstValueFrom(
        this.#tasksService.updateTask(taskDB as Task).pipe(
          tap(async (task: Task) => {
            await this.#appDatabase.updateTask(task);
            await this.#appDatabase.deleteTaskOffline(action.id!);
          }),
          catchError(async (err: HttpErrorResponse) => {
            // Falls die Aufgabe bereits gelöscht wurde, lokal ebenfalls entfernen
            if (err.status == 404) {
              await this.#appDatabase.deleteTask(taskDB.id!);
              await this.#appDatabase.deleteTaskOffline(action.id!);
            }
            return EMPTY;
          }),
        ),
      );
    } catch (error) {
      const message = `Sync local fehlgeschlagen, versuche später erneut: (${(error as HttpErrorResponse).message})`;
      this.#snackBar.open(message, 'Close', { panelClass: 'error' });
    }
  }

  // Löscht eine Aufgabe auf dem Server
  async #deleteTask(taskDB: TaskDB, action: SyncAction) {
    try {
      await firstValueFrom(
        this.#tasksService.deleteTask(taskDB as Task).pipe(
          tap(async (task) => {
            await this.#appDatabase.deleteTask(task.id);
            await this.#appDatabase.deleteTaskOffline(action.id!);
          }),
          catchError(async (err: HttpErrorResponse) => {
            // Falls die Aufgabe bereits gelöscht wurde, lokal ebenfalls entfernen
            if (err.status == 404) {
              await this.#appDatabase.deleteTask(taskDB.id!);
              await this.#appDatabase.deleteTaskOffline(action.id!);
            }
            return EMPTY;
          }),
        ),
      );
    } catch (error) {
      const message = `Sync local fehlgeschlagen, versuche später erneut: (${error})`;
      this.#snackBar.open(message, 'Close', { panelClass: 'error' });
    }
  }
}
