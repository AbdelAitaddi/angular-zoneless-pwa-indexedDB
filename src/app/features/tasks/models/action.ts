export const Action = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type SyncActionType = (typeof Action)[keyof typeof Action];
