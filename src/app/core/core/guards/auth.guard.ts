import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {return true;}
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); 
  if (!token) {if (state.url === '/login' || state.url === '/home' || state.url === '/') {return true;}router.navigate(['/login']); return false;}
  const expectedRoles = route.data['roles'] as Array<string>;
  if (expectedRoles && expectedRoles.length > 0) {
    if (expectedRoles.includes(userRole!)) {
      return true; 
    } else {
      alert('You do not have permission to access this page');
      if (userRole === 'ADMIN') router.navigate(['/admin']);
      else if (userRole === 'DOCTOR') router.navigate(['/doctor']);
      else if (userRole === 'PATIENT') router.navigate(['/patient']);
      else router.navigate(['/login']);
      
      return false;
    }
  }
  return true;
};

