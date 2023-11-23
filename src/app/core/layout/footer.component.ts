import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: '<p>© 2025 AbdelAitaddi</p>',
  styles: `
    :host {
      display: block;
      margin: 0 2rem;
      min-height: 64px;
    }

    p,
    a {
      text-align: center;
      padding: 1rem;
      margin: 0;
      font-size: 1rem;
      color: rgba(0, 0, 0, 0.6);
      border-top: 1px solid #000;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
