import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo-nauta',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (linkTo) {
      <a [routerLink]="linkTo" [attr.aria-label]="ariaLabel" [class]="wrapperClass">
        <img
          src="assets/images/logo-nauta.png"
          alt="nauta"
          [class]="imgClass"
          width="320"
          height="80"
          decoding="async"
          loading="eager"
        />
      </a>
    } @else {
      <div [class]="wrapperClass" role="img" [attr.aria-label]="ariaLabel">
        <img
          src="assets/images/logo-nauta.png"
          alt="nauta"
          [class]="imgClass"
          width="320"
          height="80"
          decoding="async"
          loading="eager"
        />
      </div>
    }
  `,
  styles: [`
    .logo-navbar {
      height: 1.5rem;
      max-width: min(6.5rem, 40vw);
    }
    @media (min-width: 640px) {
      .logo-navbar {
        height: 1.75rem;
        max-width: 8rem;
      }
    }
    @media (min-width: 1024px) {
      .logo-navbar {
        height: 2rem;
        max-width: 9.5rem;
      }
    }
    @media (min-width: 1280px) {
      .logo-navbar {
        height: 2.25rem;
        max-width: 11rem;
      }
    }

    .logo-login {
      width: 100%;
      max-width: min(9rem, 72vw);
      height: auto;
    }
    @media (min-width: 640px) {
      .logo-login {
        max-width: 11rem;
      }
    }
    @media (min-width: 768px) {
      .logo-login {
        max-width: 13rem;
      }
    }
    @media (min-width: 1024px) {
      .logo-login {
        max-width: 15rem;
      }
    }
  `],
})
export class LogoNautaComponent {
  @Input() variant: 'navbar' | 'login' = 'navbar';
  @Input() linkTo: string | null = '/dashboard';
  @Input() ariaLabel = 'nauta — inicio';

  get wrapperClass(): string {
    if (this.variant === 'login') {
      return 'flex justify-center w-full px-1 sm:px-2';
    }
    return 'flex items-center min-w-0 shrink';
  }

  get imgClass(): string {
    const base = 'w-auto object-contain rounded-sm block';
    return this.variant === 'login'
      ? `${base} logo-login rounded-md`
      : `${base} logo-navbar`;
  }
}
