import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sw-updater-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './sw-updater-dialog.component.html',
  styleUrls: ['./sw-updater-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwUpdaterDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SwUpdaterDialogComponent>);
  readonly appData = inject<{ version: string }>(MAT_DIALOG_DATA);

  onNoClick() {
    this.dialogRef.close();
  }
}
