export interface Task {
  id: number;
  title: string;
  status: StatusTypes;
  updatedAt: number;
}

export type NewTask = Omit<Task, 'id'>;

export const Status = {
  todo: 'todo',
  inProgress: 'inProgress',
  done: 'done',
} as const;

export type StatusTypes = (typeof Status)[keyof typeof Status];
