import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
declare var particlesJS: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  showPassword: boolean = false;
  isLoading: boolean = false;
  loginName:string ='';
  doctorSpecilization:string ='';
  loginData = {clinicEmail: '',clinicContact: '',clinicPassword: '', rememberMe: false,};
  constructor(private router: Router,private authService: AuthService,@Inject(PLATFORM_ID) private platformId: any) {}
  ngOnInit(): void {if (isPlatformBrowser(this.platformId)) {this.loadParticles();}}
  onLogin(): void {
    if (!this.validateLogin()) return;
    this.isLoading = true;
    const identifier = this.loginData.clinicEmail;
    const payload: any = {
      clinicEmail: identifier,
      clinicContact: identifier,
      clinicPassword: this.loginData.clinicPassword,
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        const role = res?.response_datas?.data?.roleName;
        const token = res?.response_identifier?.token;
        const loginName= res?.response_identifier?.doctor_full_name || res?.response_identifier?.clinic_name || res?.response_identifier?.patient_name ||'';
        const doctorSpecilization = res?.response_datas?.doctor_specialization || '';
        if (role && token) {
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', role);
          localStorage.setItem('loginName', loginName);
          localStorage.setItem('doctorSpecilization', doctorSpecilization);
          this.redirectUser(role);
        } else {
          this.isLoading = false;
          Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Your account role is not properly configured.',
            confirmButtonColor: '#3085d6',
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: 'Invalid Email/Contact or Password. Please try again.',
          confirmButtonColor: '#d33',
          footer: '<a href="#">Forgot Password?</a>',
        });
      },
    });
  }

  loadParticles(): void {
    particlesJS('particles-js', {
      particles: {
        number: { value: 360, density: { enable: true, value_area: 800 } },
        color: { value: ['#ffffff', '#4fc3f7', '#81c784', '#ffb74d'] },
        shape: {
          type: ['circle', 'star', 'triangle'],
          stroke: { width: 0, color: '#000000' },
          polygon: { nb_sides: 5 },
        },
        opacity: {
          value: 0.8,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 2, size_min: 0.1, sync: false },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#4fc3f7',
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: { enable: true, rotateX: 600, rotateY: 1200 },
        },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true,
        },
        modes: {
          grab: { distance: 200, line_linked: { opacity: 0.5 } },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 0.8,
            speed: 3,
          },
          repulse: { distance: 200, duration: 0.4 },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 },
        },
      },
      retina_detect: true,
    });
  }

  redirectUser(role: string) {switch (role) {case 'ADMIN':this.router.navigate(['/admin']);break;case 'DOCTOR':this.router.navigate(['/doctor']);break;case 'PATIENT':this.router.navigate(['/patient']);break;default:alert('Role not found'); }}
  validateLogin(): boolean {
  if (!this.loginData.clinicEmail && !this.loginData.clinicContact) {alert('Please enter your email or contact number');return false;}
  if (this.loginData.clinicContact) {const contactPattern = /^[0-9]{10}$/;if (!contactPattern.test(this.loginData.clinicContact)) {alert('Invalid contact number. It should be 10 digits.');return false; }}
  if (!this.loginData.clinicPassword) {alert('Please enter your password');return false;}
  if (this.loginData.clinicPassword.length < 6) {alert('Password must be at least 6 characters long'); return false;}return true;}
  loginWithGoogle(): void {}
  loginWithMicrosoft(): void {}
  loginWithApple(): void {}
  togglePasswordVisibility(): void {this.showPassword = !this.showPassword;}
  goToRegister(): void { this.router.navigate(['/registration']);}
  goToForgotPassword(): void {this.router.navigate(['/forgot-password']);}
  goToHome(): void {this.router.navigate(['/']);}
}
