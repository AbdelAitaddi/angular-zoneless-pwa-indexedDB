import { ChangeDetectionStrategy, Component, computed, input, output, Signal } from '@angular/core';
import { Task } from '../../models/task';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { SyncAction } from '../../services/task-database.service';
import { SyncActionStatus } from '../task-drag-drop-list/task-list-drag-drop.component';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [MatIconButton, MatTooltip, MatIcon],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TaskItemComponent {
  task = input.required<Task>();
  isLastItem = input.required<boolean>();
  syncAction = input.required<SyncActionStatus>();

  editTask = output<Task>();
  deleteTask = output<Task>();
  undoDeleteTask = output<number>();

  hideMessage: Signal<boolean> = computed(
    () => !(this.syncAction().created || this.syncAction().updated || this.syncAction().deleted),
  );

  undo(deleted: SyncAction | null): void {
    if (deleted?.id) {
      this.undoDeleteTask.emit(deleted.id);
    }
  }
}
