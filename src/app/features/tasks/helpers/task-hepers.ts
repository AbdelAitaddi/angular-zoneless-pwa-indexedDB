import { NewTask, Task } from '../models/task';

export function isTask(task: Task | NewTask): task is Task {
  return (task as Task).id !== undefined;
}
