import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private tokenService: TokenService) {}
  private baseURL = (environment as any).apiUrl;
  private storageKeys = ['token','access_token','userRole','loginName','doctorSpecilization',];
  login(payload: any) {return this.http.post<any>(`${this.baseURL}/auth/login`, payload);}
  registerClinic(payload: any): Observable<any> {return this.http.post<any>(`${this.baseURL}/registration`, payload);}
  registerPatient(payload: any): Observable<any> {
    const clinicId = '69987a37-2e55-4e62-96d9-66e04e2f48ed';
    const url = `${this.baseURL}/patients/clinic/${clinicId}/patients`;
    return this.http.post<any>(url, payload);
  }
  logout() {this.storageKeys.forEach((key) => localStorage.removeItem(key)); this.tokenService.clearToken();}
}
