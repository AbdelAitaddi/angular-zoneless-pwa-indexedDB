import { ChangeDetectionStrategy, Component, inject, output, Signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';

import { distinctUntilChanged, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { Breakpoints } from '../config/breakpoints.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, RouterLinkActive],
  template: `
    <mat-toolbar>
      <button mat-icon-button class="menu" (click)="toggleSidenav.emit()" aria-label="Menu icon">
        <mat-icon>menu</mat-icon>
      </button>
      <a routerLink="/" class="app-name">Taskly</a>
      @if (!isSmallScreen()) {
        <div class="content">
          <a
            mat-button
            routerLink="/tasks"
            [routerLinkActive]="'active'"
            [routerLinkActiveOptions]="{ exact: true }"
            aria-label="Overview"
            >Tasks</a
          >
          <a
            mat-button
            routerLink="/dashboard"
            [routerLinkActive]="'active'"
            [routerLinkActiveOptions]="{ exact: true }"
            aria-label="Dashboard"
            >Dashboard</a
          >
        </div>
      }
    </mat-toolbar>
  `,
  styles: `
    .app-name {
      font-weight: bold;
    }

    .menu {
      z-index: 9999;
    }

    .content {
      display: flex;
      justify-content: center;
      flex: 1 1 auto;

      a + a {
        margin-left: 32px;
      }
    }
    a {
      color: inherit;
      text-decoration: none;
      padding: 8px 12px;
      min-width: 109px;
    }

    .active {
      font-weight: bold;
      border-bottom: 2px solid #000000;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  toggleSidenav = output();
  #breakpointObserver = inject(BreakpointObserver);

  isSmallScreen: Signal<boolean> = toSignal(
    this.#breakpointObserver.observe([Breakpoints.smallScreen]).pipe(
      map((result) => result.matches),
      distinctUntilChanged(),
    ),
    { requireSync: true },
  );
}
