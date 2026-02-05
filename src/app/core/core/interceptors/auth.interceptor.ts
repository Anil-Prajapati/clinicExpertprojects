import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  return next(
    token
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        })
      : req
  );
};
