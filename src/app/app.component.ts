import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './core/layout/header.component';
import { FooterComponent } from './core/layout/footer.component';
import { SidenavComponent } from './core/layout/sidenav.component';

import { NetworkService } from './core/services/network.service';

import { SwUpdateService } from './core/services/sw-update.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VersionReadyEvent } from '@angular/service-worker';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, SidenavComponent, RouterOutlet, MatDialogModule],
  template: `
    <app-header (toggleSidenav)="sidenav.toggle()" />
    <app-sidenav #sidenav>
      <router-outlet />
    </app-sidenav>
    <app-footer />
  `,
  host: {
    '[style.display]': "'flex'",
    '[style.flex-direction]': "'column'",
    '[style.min-height]': "'100vh'",
  },
  styles: `
    .offline {
      font-weight: bold;
      background-color: #fdd835;
      padding: 20px;
      color: red;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  readonly #destroyRef = inject(DestroyRef);
  readonly #snackBar = inject(MatSnackBar);
  readonly #networkService = inject(NetworkService);
  readonly #swUpdater = inject(SwUpdateService);

  constructor() {
    effect(() => {
      if (this.#networkService.online() === false) {
        this.#snackBar.open(`You are offline, try connected with internet.`, undefined, {
          panelClass: 'warn',
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      } else {
        this.#snackBar.dismiss();
      }
    });

    this.#swUpdater.pollingForUpdates$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => this.#swUpdater.checkForUpdate());
  }

  ngOnInit() {
    this.#swUpdater
      .versionUpdates()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((evt: VersionReadyEvent) => this.#swUpdater.onVersionUpdates(evt));

    this.#swUpdater.unrecoverable().pipe(takeUntilDestroyed(this.#destroyRef)).subscribe();
  }
}
