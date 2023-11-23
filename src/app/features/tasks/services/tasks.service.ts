import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

import { NewTask, Task } from '../models/task';

const API_URL = 'http://localhost:3000/tasks';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  readonly #http = inject(HttpClient);

  getTask(task: Task): Observable<Task> {
    return this.#http.get<Task>(`${API_URL}/${task.id}`).pipe(catchError(this.#handleError));
  }

  getTasks(updatedAt?: number): Observable<Task[]> {
    const query = updatedAt ? `?updatedAt_gt=${updatedAt}` : '';
    return this.#http.get<Task[]>(`${API_URL}${query}`).pipe(catchError(this.#handleError));
  }

  addTask(payload: NewTask): Observable<Task> {
    return this.#http.post<Task>(`${API_URL}`, payload).pipe(catchError(this.#handleError));
  }

  updateTask(task: Task): Observable<Task> {
    return this.#http.put<Task>(`${API_URL}/${task.id}`, task).pipe(catchError(this.#handleError));
  }

  deleteTask(task: Task): Observable<Task> {
    return this.#http.delete<Task>(`${API_URL}/${task.id}`).pipe(catchError(this.#handleError));
  }

  async getTasksPromise(abortSignal: AbortSignal): Promise<Task[]> {
    const response = await fetch(API_URL, { signal: abortSignal });
    if (!response.ok) {
      throw Error('Could not fetch dashboard....');
    }
    return response.json();
  }

  #handleError(err: HttpErrorResponse) {
    if (err.error instanceof ErrorEvent) {
      // client-side
      console.warn('Client', err.message);
    } else {
      // server-side
      console.warn('Server', err.status);
    }
    return throwError(() => err);
  }
}
