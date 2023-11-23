import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';

import { isTask } from '../../helpers/task-hepers';
import { NewTask, Task } from '../../models/task';

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    FormsModule,
    MatLabel,
    MatButton,
    MatHint,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrls: ['./task-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TaskFormDialogComponent {
  protected readonly isTask = isTask;
  readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  readonly task = inject<Task | NewTask>(MAT_DIALOG_DATA);

  form = inject(FormBuilder).group({
    title: new FormControl(this.task.title || '', {
      nonNullable: true,
      validators: [Validators.minLength(3)],
    }),
  });

  get titleFieldLength(): number {
    return (this.form.get('title') as FormControl).value.length;
  }

  submit() {
    const { valid, value } = this.form;

    if (valid && value.title !== this.task.title) {
      this.dialogRef.close({
        ...this.task,
        title: value.title,
        updatedAt: Date.now(),
      } as Task | NewTask);
    }
  }
}
