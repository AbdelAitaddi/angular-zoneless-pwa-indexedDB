import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge, shareReplay, startWith } from 'rxjs';
import { WINDOW } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  readonly #window = inject(WINDOW) as Window;

  readonly #connectionEvents$ = merge(
    fromEvent(this.#window, 'online').pipe(map(() => true)),
    fromEvent(this.#window, 'offline').pipe(map(() => false)),
  ).pipe(startWith(navigator.onLine), shareReplay(1));

  online: Signal<boolean | undefined> = toSignal(this.#connectionEvents$, { requireSync: true });
}
