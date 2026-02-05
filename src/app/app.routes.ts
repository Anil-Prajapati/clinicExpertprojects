import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { PlansComponent } from './plans/plans.component';
import { AdminComponent } from './admin/admin.component';
import { DoctorComponent } from './doctor/doctor.component';
import { PatientComponent } from './patient/patient.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { InventoryComponent } from './inventory/inventory.component';
import { authGuard } from './core/core/guards/auth.guard';
import { Routes } from '@angular/router';
import { DoctorListComponent } from './doctor-list/doctor-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'doctor', component: DoctorComponent, canActivate:[authGuard], data:{roles:['DOCTOR']} },
  { path: 'patient', component: PatientComponent, canActivate:[authGuard], data:{roles:['PATIENT']} },
  { path: 'plans', component: PlansComponent },
  { path: 'appointment', component: AppointmentComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT'] } },
  { path: 'doctor-list', component: DoctorListComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT'] } },
  { path: 'inventory', component: InventoryComponent }
];
