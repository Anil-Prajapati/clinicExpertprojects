import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DummyUser {
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
}

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
  styleUrl: './login.component.css'
})
export class LoginComponent {

  showPassword: boolean = false;

  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (!this.validateLogin()) return;

    console.log("Sending Login Request =>", this.loginData);

    // === Dummy Login Logic ===
    const user = DUMMY_USERS.find(
      u => u.email === this.loginData.email && u.password === this.loginData.password
    );

    if (!user) {
      alert("Invalid email or password!");
      return;
    }

    // Future Ready (Backend logic)
    // this.authService.login(this.loginData).subscribe(...)

    // === Role-Based Redirect ===
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
        alert("Role not found");
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  loginWithGoogle(): void {}
  loginWithMicrosoft(): void {}
  loginWithApple(): void {}

  goToRegister(): void {
    this.router.navigate(['/registration']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
