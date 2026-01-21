import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
declare var particlesJS: any;

interface DummyUser {email: string;password: string;role: 'admin' | 'doctor' | 'patient';}
const DUMMY_USERS: DummyUser[] = [
  { email: 'admin@clinic.com', password: 'admin123', role: 'admin' },
  { email: 'doctor@clinic.com', password: 'doc123', role: 'doctor' },
  { email: 'patient@clinic.com', password: 'pat123', role: 'patient' },
];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  showPassword: boolean = false;

  loginData = {
    email: '',
    password: '',
    rememberMe: false,
  };

  constructor(private router: Router,@Inject(PLATFORM_ID) private platformId: any) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadParticles();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (!this.validateLogin()) return;
    console.log('Sending Login Request =>', this.loginData);
    const user = DUMMY_USERS.find(
      (u) =>
        u.email === this.loginData.email &&
        u.password === this.loginData.password
    );
    if (!user) {alert('Invalid email or password!');return;
    }
    this.redirectUser(user.role);
  }

  redirectUser(role: string) {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'doctor':
        this.router.navigate(['/doctor']);
        break;
      case 'patient':
        this.router.navigate(['/patient']);
        break;
      default:
        alert('Role not found');
    }
  }

  validateLogin(): boolean {
    if (!this.loginData.email) {
      alert('Please enter your email address');
      return false;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (!this.loginData.password) {
      alert('Please enter your password');
      return false;
    }

    if (this.loginData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;return emailRegex.test(email);}
  loginWithGoogle(): void {}
  loginWithMicrosoft(): void {}
  loginWithApple(): void {}

 loadParticles(): void {
  particlesJS('particles-js', {
    particles: {
      number: {value: 360,density: {enable: true,value_area: 800}},
      color: {value: ['#ffffff', '#4fc3f7', '#81c784', '#ffb74d'] },
      shape: {type: ['circle', 'star', 'triangle'], stroke: {width: 0,color: '#000000'},polygon: {nb_sides: 5}},
      opacity: {value: 0.8,random: true, anim: {enable: true,   speed: 1,opacity_min: 0.1,sync: false}},size: {value: 3,random: true,anim: {enable: true,   speed: 2,size_min: 0.1,sync: false}},
      line_linked: {enable: true,distance: 150,color: '#4fc3f7', opacity: 0.2,width: 1},move: {enable: true,speed: 1,direction: 'none',random: true,    straight: false, out_mode: 'out',bounce: false,attract: {enable: true,   rotateX: 600, rotateY: 1200}}},
    interactivity: {detect_on: 'canvas',events: {onhover: {enable: true,mode: 'grab'  },onclick: {enable: true,mode: 'push'    },resize: true },modes: {grab: { distance: 200,line_linked: {opacity: 0.5}},bubble: {distance: 400, size: 40,duration: 2,opacity: 0.8,speed: 3}, repulse: { distance: 200,duration: 0.4 },push: {particles_nb: 4},remove: {particles_nb: 2} }},retina_detect: true});}

  goToRegister(): void {this.router.navigate(['/registration']);}
  goToForgotPassword(): void {this.router.navigate(['/forgot-password']);}
  goToHome():void {this.router.navigate(['/']); }
}
