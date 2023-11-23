import {
  ApplicationConfig,
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideExperimentalZonelessChangeDetection,
  isDevMode,
  InjectionToken,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IMAGE_CONFIG, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { provideRouterConfig } from './app.routes';

export const BROWSER_LOCATION = new InjectionToken<Location>('window location');
export const WINDOW = new InjectionToken<Window>('window');

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(),
    AppEnvironmentProviders(),
    provideRouterConfig(),
    provideExperimentalZonelessChangeDetection(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

export function AppEnvironmentProviders(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: BROWSER_LOCATION,
      useFactory: () => window.location,
    },
    {
      provide: WINDOW,
      useFactory: () => window,
    },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: false,
        disableImageLazyLoadWarning: false,
      },
    },
  ]);
}
