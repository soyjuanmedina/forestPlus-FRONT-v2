import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const user = authService.getCurrentUser();
    if (user?.forcePasswordChange && state.url !== '/profile' && !state.url.includes('mustChange=true')) {
      router.navigate(['/profile'], { queryParams: { mustChange: 'true' } });
      return false;
    }
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
