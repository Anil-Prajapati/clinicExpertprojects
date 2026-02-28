import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Token expired or invalid. Redirecting to login...');

        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        Swal.fire({
          icon: 'info',
          title: 'Session Expired',
          text: 'Security reason ki wajah se aapko fir se login karna hoga.',
          timer: 10000,
          showConfirmButton: false,
        }).then(() => {
          router.navigate(['/login']);
        });
      }
      return throwError(() => error);
    })
  );
};
