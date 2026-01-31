import {Component,signal,computed,OnInit,Inject,PLATFORM_ID, inject,} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/core/services/auth.service';

interface Patient {id: number;name: string;age: number;gender: string;bloodGroup: string;status: string;contact: string;admissionDate: string;}
interface Theme {name: string;primary: string;secondary: string;gradient: string;light: string;hover: string;}
@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css',
})
export class PatientComponent implements OnInit {

  searchTerm = signal('');
  showThemeMenu = signal(false);
  selectedTheme = signal('blue');
  activeNav = signal('dashboard');
  sidebarOpen = signal(false);
  private router = inject(Router); 
  private TOKEN_KEY = 'access_token';
  private ROLE_KEY = 'userRole';
  loginName: string | null = '';
  specialization: string | null = '';
  role: string | null = ''; 

  constructor(@Inject(PLATFORM_ID) private platformId: Object,public authService:AuthService) {}

  themes: Theme[] = [
    {name: 'blue',primary: '#0d6efd',secondary: '#0b5ed7',gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',light: '#e7f1ff',hover: 'rgba(13, 110, 253, 0.1)',},
    {name: 'purple',primary: '#6f42c1',secondary: '#5a32a3',gradient: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)',light: '#f3e8ff',hover: 'rgba(111, 66, 193, 0.1)',},
    {name: 'green',primary: '#198754',secondary: '#157347',gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',light: '#d1f4e0',hover: 'rgba(25, 135, 84, 0.1)',},
    {name: 'orange',primary: '#fd7e14',secondary: '#e8590c',gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',light: '#ffe5d0',hover: 'rgba(253, 126, 20, 0.1)',},
    {name: 'teal',primary: '#20c997',secondary: '#1aa179',gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',light: '#d2f4ea',hover: 'rgba(32, 201, 151, 0.1)',},
    {name: 'pink',primary: '#d63384',secondary: '#b02a6f',gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',light: '#f7d6e6',hover: 'rgba(214, 51, 132, 0.1)',},];

  patients = signal<Patient[]>([
    {id: 1001,name: 'Rajesh Kumar',age: 45,gender: 'Male',bloodGroup: 'O+',status: 'Stable',contact: '+91 98765 43210',admissionDate: '15 Jan 2026',},
    {id: 1002,name: 'Priya Sharma',age: 32,gender: 'Female',bloodGroup: 'A+',status: 'Critical',contact: '+91 98765 43211',admissionDate: '18 Jan 2026',},
    {id: 1003,name: 'Amit Patel',age: 28,gender: 'Male',bloodGroup: 'B+',status: 'Stable',contact: '+91 98765 43212',admissionDate: '20 Jan 2026',},
    {id: 1004,name: 'Sneha Verma',age: 56,gender: 'Female',bloodGroup: 'AB+',status: 'Stable',contact: '+91 98765 43213',admissionDate: '21 Jan 2026',},]);

  filteredPatients = computed(() => {const term = this.searchTerm().toLowerCase();if (!term) return this.patients();return this.patients().filter(p => p.name.toLowerCase().includes(term));});
  currentTheme = computed(() => {return this.themes.find(t => t.name === this.selectedTheme()) || this.themes[0];});
  criticalCount = computed(() => {return this.patients().filter(p => p.status === 'Critical').length;});
  stableCount = computed(() => {return this.patients().filter(p => p.status === 'Stable').length; });
  changeTheme(themeName: string) {this.selectedTheme.set(themeName);this.showThemeMenu.set(false);this.applyTheme();}
  toggleThemeMenu() {this.showThemeMenu.update(v => !v);}
  toggleSidebar() {this.sidebarOpen.update(v => !v); }
  closeSidebar() {this.sidebarOpen.set(false);}
  setActiveNav(nav: string) {
  this.activeNav.set(nav); // Jo nav pass ho wahi set ho
  if (nav === 'appointments') {
    this.router.navigate(['/appointment']); // Route 'appointment' hai
  }
  this.closeSidebar(); // Click karne par sidebar band ho jaye
}
  deletePatient(id: number) { if (confirm('Are you sure you want to delete this patient?')) {this.patients.update(patients => patients.filter(p => p.id !== id));}}
  applyTheme() {
    const theme = this.currentTheme();
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    document.documentElement.style.setProperty('--theme-gradient', theme.gradient);
    document.documentElement.style.setProperty('--theme-light', theme.light);
    document.documentElement.style.setProperty('--theme-hover', theme.hover);
  }
  onLogout() {this.authService.logout();this.router.navigate(['/login']); }
  ngOnInit() {if (isPlatformBrowser(this.platformId)) {this.applyTheme();
     this.loginName = localStorage.getItem('loginName');
     this.specialization = localStorage.getItem('doctorSpecilization');
     this.role = localStorage.getItem('userRole');
  }}
  getAvatarUrl(name: string): string {if (!name) {return 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff';} return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`;}
}
