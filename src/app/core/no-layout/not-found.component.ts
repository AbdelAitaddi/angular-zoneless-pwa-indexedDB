import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [RouterLink, MatAnchor, MatIcon],
  template: `
    <h1>Oops!</h1>
    <h2>Something went wrong.</h2>
    <a mat-button color="primary" routerLink="/">
      Take me
      <mat-icon>home</mat-icon>
    </a>
  `,
  styles: `
    :host {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFoundComponent {}
