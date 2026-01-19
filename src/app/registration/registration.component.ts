import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Register Form Data
  registerData = {
    fullName: '',
    email: '',
    phone: '',
    clinicName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };

  constructor(private router: Router) {}

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Handle registration
  onRegister(): void {
    if (this.validateRegistration()) {
      console.log('Register Data:', this.registerData);
      // Add your registration API call here
      // Example:
      // this.authService.register(this.registerData).subscribe(
      //   response => {
      //     console.log('Registration successful', response);
      //     alert('Registration successful! Please login.');
      //     this.router.navigate(['/login']);
      //   },
      //   error => {
      //     console.error('Registration failed', error);
      //     alert('Registration failed. Please try again.');
      //   }
      // );

      // For now, just show success message
      alert('Registration successful! Redirecting to login...');
      this.router.navigate(['/login']);
    }
  }

  // Validate registration form
  validateRegistration(): boolean {
    // Check full name
    if (
      !this.registerData.fullName ||
      this.registerData.fullName.trim().length < 3
    ) {
      alert('Please enter your full name (minimum 3 characters)');
      return false;
    }

    // Check email
    if (!this.registerData.email) {
      alert('Please enter your email address');
      return false;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    // Check phone (optional but validate if provided)
    if (
      this.registerData.phone &&
      !this.isValidPhone(this.registerData.phone)
    ) {
      alert('Please enter a valid phone number');
      return false;
    }

    // Check password
    if (!this.registerData.password) {
      alert('Please enter a password');
      return false;
    }

    if (this.registerData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return false;
    }

    if (!this.isStrongPassword(this.registerData.password)) {
      alert(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
      return false;
    }

    // Check confirm password
    if (!this.registerData.confirmPassword) {
      alert('Please confirm your password');
      return false;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Passwords do not match');
      return false;
    }

    // Check terms acceptance
    if (!this.registerData.acceptTerms) {
      alert('Please accept the terms and conditions');
      return false;
    }

    return true;
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  // Strong password validation
  isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  }

  // Social registration handlers
  registerWithGoogle(): void {
    console.log('Google Registration');
    // Add Google OAuth logic
  }

  registerWithMicrosoft(): void {
    console.log('Microsoft Registration');
    // Add Microsoft OAuth logic
  }

  registerWithApple(): void {
    console.log('Apple Registration');
    // Add Apple OAuth logic
  }

  // Navigate to login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
