import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatCard } from '@angular/material/card';
import { StatusTypes } from '../../../tasks/models/task';

export const taskProgressAnimation = trigger('taskProgressTrigger', [
  transition(':enter', [style({ width: '10px', opacity: 0 }), animate('1s', style({ width: '', opacity: 0.6 }))]),
]);

@Component({
  selector: 'app-dashboard-item',
  standalone: true,
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard],
  animations: [taskProgressAnimation],
})
export default class DashboardItemComponent {
  title = input.required<string>();
  percentage = input.required<number>();
  status = input.required<StatusTypes>();
}
