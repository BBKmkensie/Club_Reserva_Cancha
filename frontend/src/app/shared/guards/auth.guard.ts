import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRoleService } from '../services/auth-role.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthRoleService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
