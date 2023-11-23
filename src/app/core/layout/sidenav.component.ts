import { ChangeDetectionStrategy, Component, inject, Signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDrawerMode, MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatLine } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { Breakpoints } from '../config/breakpoints.config';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  template: `
    <mat-sidenav-container>
      <mat-sidenav #sidenav [mode]="sidenavMode()" [opened]="false" [fixedInViewport]="false" [autoFocus]="false">
        <mat-nav-list>
          @defer (on immediate) {
            <a
              mat-list-item
              (click)="sidenav.toggle()"
              routerLink="/tasks"
              [routerLinkActive]="'active'"
              [routerLinkActiveOptions]="{ exact: true }"
              aria-label="overview"
              data-test-id="nav-overview-link"
            >
              <mat-icon matListItemIcon class="icon">format_list_numbered</mat-icon>
              <span mat-line matListItemTitle>Tasks</span>
            </a>
            <a
              mat-list-item
              (click)="sidenav.toggle()"
              routerLink="/dashboard"
              [routerLinkActive]="'active'"
              [routerLinkActiveOptions]="{ exact: true }"
              aria-label="dashboard"
              data-test-id="nav-dashboard-link"
            >
              <mat-icon matListItemIcon class="icon">area_chart</mat-icon>
              <span mat-line matListItemTitle>Dashboard</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <ng-content />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      display: flex;
      height: calc(100vh - 128px);
    }

    .sidenav-title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: x-large;
      padding: 16px;
      margin-bottom: 4px;
      background-color: #f5f5f5;
    }

    a {
      mat-icon {
        margin-top: 0 !important;
        align-self: center !important;
      }
    }

    a + a {
      margin-top: 4px;
    }

    .icon {
      align-self: center;
      margin: 0 16px;
      color: var(--mat-sys-on-primary) !important;
    }

    .active {
      font-weight: bold;
      color: #ffffff;
      border-radius: unset !important;
      background-color: #000000 !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatNavList,
    MatSidenav,
    MatSidenavContent,
    MatSidenavContainer,
    RouterLink,
    RouterLinkActive,
    MatListItem,
    MatLine,
    MatIcon,
  ],
})
export class SidenavComponent {
  sidenav = viewChild.required(MatSidenav);
  #breakpointObserver = inject(BreakpointObserver);

  toggle() {
    this.sidenav().toggle();
  }
  sidenavMode: Signal<MatDrawerMode> = toSignal(
    this.#breakpointObserver
      .observe([Breakpoints.largeScreen])
      .pipe(map((result) => (result.matches ? 'over' : 'side') as MatDrawerMode)),
    { requireSync: true },
  );

  isOpened: Signal<boolean> = toSignal(
    this.#breakpointObserver.observe([Breakpoints.smallScreen]).pipe(map((result) => result.matches)),
    { requireSync: true },
  );
}
