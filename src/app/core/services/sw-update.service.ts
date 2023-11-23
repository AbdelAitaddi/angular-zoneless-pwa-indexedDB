import { SwUpdate, UnrecoverableStateEvent, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { ApplicationRef, inject, Injectable } from '@angular/core';
import { concat, EMPTY, filter, first, interval, tap } from 'rxjs';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import SwUpdaterDialogComponent from '../../shared/components/sw-updater-dialog/sw-updater-dialog.component';
import { BROWSER_LOCATION } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  readonly #appRef = inject(ApplicationRef);
  readonly #updater = inject(SwUpdate);
  readonly #dialog = inject(MatDialog);
  readonly #location = inject(BROWSER_LOCATION) as Location;

  // es überprüft, ob Updates verfügbar sind
  get pollingForUpdates$() {
    const appIsStable$ = this.#appRef.isStable.pipe(first((isStable) => isStable));
    const everySixHours$ = interval(1000 * 10 * 1); // 1 Minute -- nur zu Testzwecken, sollte auf 6 Stunden gesetzt werden
    // Starte die Update-Überprüfung, sobald die App stabil ist, und wiederhole es regelmäßig.
    return concat(appIsStable$, everySixHours$);
  }

  // Überprüfung auf Updates
  async checkForUpdate() {
    if (this.#updater.isEnabled) {
      try {
        console.info('Checking for updates...');
        const updateFound = await this.#updater.checkForUpdate();
        console.info(updateFound ? 'A new version is available.' : 'Already on the latest version.');
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    }
  }

  // Lauscht auf Version-Updates
  versionUpdates() {
    if (this.#updater.isEnabled) {
      return this.#updater.versionUpdates.pipe(
        filter((evt: VersionEvent): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      );
    }
    return EMPTY;
  }

  // Wird aufgerufen, wenn eine neue Version verfügbar ist
  onVersionUpdates(evt: VersionReadyEvent) {
    console.info(`Current app version : ${evt.currentVersion.hash}`);
    console.info(`New app version ready for use: ${evt.latestVersion.hash}`);

    const appData = evt.latestVersion.appData as { version: string };
    const dialogConfig: MatDialogConfig<{ version: string }> = {
      id: 'sw-updater-container',
      width: '400px',
      autoFocus: true,
      disableClose: true,
      enterAnimationDuration: '00ms',
      exitAnimationDuration: '00ms',
      data: appData,
    };

    this.#dialog
      .open(SwUpdaterDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe({ next: () => this.#location.reload() });
  }

  unrecoverable() {
    if (this.#updater.isEnabled) {
      return this.#updater.unrecoverable.pipe(
        tap({
          next: (event: UnrecoverableStateEvent) => {
            console.error(
              'An error occurred that we cannot recover from:\n' + event.reason + '\n\nPlease reload the page.',
            );
          },
        }),
      );
    }
    return EMPTY;
  }
}
