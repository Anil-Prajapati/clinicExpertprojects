import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private getAuthHeaders(): HttpHeaders {const token = this.tokenService.getToken();return new HttpHeaders({Authorization: `Bearer ${token}`});}
  private storageKeys = ['token','access_token','userRole','loginName','doctorSpecilization','doctorId'];
  login(payload: any) {return this.http.post<any>(`${this.baseURL}/auth/login`, payload);}
  registerClinic(payload: any): Observable<any> {return this.http.post<any>(`${this.baseURL}/registration`, payload);}
  registerPatient(payload: any): Observable<any> {const clinicId = '69987a37-2e55-4e62-96d9-66e04e2f48ed';const url = `${this.baseURL}/patients/clinic/${clinicId}/patients`;return this.http.post<any>(url, payload);}
  getDoctorList(){const token = this.tokenService.getToken(); const headers = new HttpHeaders({'Authorization': `Bearer ${token}`}); return this.http.get<any>(`${this.baseURL}/doctor/list`,{ headers })}
  bookAppointmentRegistration(payload: any): Observable<any> {const token = this.tokenService.getToken();const headers = token? new HttpHeaders({ Authorization: `Bearer ${token}` }): undefined;return this.http.post<any>(`${this.baseURL}/user/appointment`, payload, { headers });}
  logout() {this.storageKeys.forEach((key) => localStorage.removeItem(key)); this.tokenService.clearToken();}
  getNotifications(doctorId: string): Observable<any[]> {return this.http.get<any[]>(`${this.baseURL}/notifications/doctor/${doctorId}`,{ headers: this.getAuthHeaders() });}
  getUnreadCount(doctorId: string): Observable<number> {return this.http.get<number>(`${this.baseURL}/notifications/count/${doctorId}`,{ headers: this.getAuthHeaders() });}
  markAllNotificationsAsRead(doctorId: string): Observable<any> {return this.http.put(`${this.baseURL}/notifications/mark-all-read/${doctorId}`,{},{ headers: this.getAuthHeaders() }); }
  markSingleNotificationAsRead(notificationId: number): Observable<any> {return this.http.put(`${this.baseURL}/notifications/${notificationId}/read`,{},{ headers: this.getAuthHeaders() });}
  getAllInventory():Observable<any[]>{ return this.http.get<any[]>(`${this.baseURL}/inventory`,{headers:this.getAuthHeaders()});}
  createInventory(inventoryData:any){return this.http.post<any>(`${this.baseURL}/inventory/create`,inventoryData,{ headers: this.getAuthHeaders()})}
  updateInventory(id: number, inventoryData: any): Observable<any> {return this.http.put<any>(`${this.baseURL}/inventory/update/${id}`, inventoryData, {  headers: this.getAuthHeaders() });}
  deleteInventory(id: number): Observable<any> {return this.http.delete<any>(`${this.baseURL}/inventory/${id}`, {headers: this.getAuthHeaders()});}
  findAllAppointments(): Observable<any[]> {return this.http.get<any[]>(`${this.baseURL}/user/all/appointment`,{headers: this.getAuthHeaders()});}
  updateDoctor(id: string, doctorData: any): Observable<any> {return this.http.put<any>(`${this.baseURL}/update/${id}`, doctorData, { headers: this.getAuthHeaders() });}
  deleteDoctor(id: string): Observable<any> {return this.http.delete<any>(`${this.baseURL}/delete/${id}`, { headers: this.getAuthHeaders() });}
  addDoctor(doctorData: any): Observable<any> {return this.http.post<any>(`${this.baseURL}/add/doctor`, doctorData, { headers: this.getAuthHeaders() });}
  getAllPatient():Observable<any>{
    return this.http.get<any>(`${this.baseURL}/patients/all`,{headers:this.getAuthHeaders()})
  }
}
