import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/core/services/auth.service';
import Swal from 'sweetalert2';

declare var particlesJS: any;

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent implements OnInit {
  selectedRole: 'CLINIC' | 'PATIENT' = 'CLINIC';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  registerData: any = {
    clinicCode: '', // Naya field
    clinicName: '',
    clinicStatus: 'ACTIVE',
    clinicContact: '',
    clinicEmail: '',
    clinicPassword: '',
    confirmPassword: '', // Sirf validation ke liye
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    clinicPinCode: '',
    clinicTimezone: 'IST',
    clinicOpeningTime: '09:00',
    clinicClosingTime: '21:00',
    clinicSubscriptionPlan: 'FREE',
    clinicLogo: 'default-logo.png', // Default value set kar di
    resetToken: '',
    acceptTerms: false,
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadParticles();
    }
  }

  onRoleChange() {
    this.registerData = {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      city: '',
      state: '',
      address: '',
      pinCode: '',
      clinicName: '',
      clinicOpeningTime: '09:00',
      clinicClosingTime: '21:00',
      clinicSubscriptionPlan: 'FREE',
      clinicTimezone: 'IST',
      fullName: '',
      gender: 'MALE',
      dob: '',
      bloodGroup: '',
      acceptTerms: false,
    };
  }
  onRegister() {
    if (!this.validateRegistration()) return;

    this.isLoading = true;

    if (this.selectedRole === 'CLINIC') {
      const clinicPayload = {
        clinicCode: this.registerData.clinicCode ||'GEN-' + Math.floor(Math.random() * 9000),
        clinicName: this.registerData.clinicName,
        clinicStatus: 'ACTIVE',
        clinicContact: this.registerData.clinicContact,
        clinicEmail: this.registerData.clinicEmail,
        clinicPassword: this.registerData.clinicPassword,
        clinicAddress: this.registerData.clinicAddress,
        clinicCity: this.registerData.clinicCity,
        clinicState: this.registerData.clinicState,
        clinicPinCode: this.registerData.clinicPinCode,
        clinicTimezone: this.registerData.clinicTimezone,
        clinicOpeningTime: this.registerData.clinicOpeningTime,
        clinicClosingTime: this.registerData.clinicClosingTime,
        clinicSubscriptionPlan: this.registerData.clinicSubscriptionPlan,
        clinicLogo: this.registerData.clinicLogo,
        resetToken: this.registerData.resetToken,
      };

      console.log('Clinic PayLoad', clinicPayload);
      this.authService.registerClinic(clinicPayload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
    } else {
      const patientPayload = {
        fullName: this.registerData.fullName,
        patientEmail: this.registerData.email,
        contactNumber: this.registerData.phone,
        patientPassword: this.registerData.password,
        gender: this.registerData.gender,
        dateOfBirth: this.registerData.dob,
        bloodGroup: this.registerData.bloodGroup,
        address: this.registerData.address,
        city: this.registerData.city,
        state: this.registerData.state,
        pinCode: this.registerData.pinCode,
        patientStatus: 'ACTIVE',
      };

      console.log('Patient PayLoad', patientPayload);
      this.authService.registerPatient(patientPayload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
    }
  }
  validateRegistration(): boolean {
    const data = this.registerData;
    const isClinic = this.selectedRole === 'CLINIC';

    // 1. Email Validation
    const emailVal = isClinic ? data.clinicEmail : data.email;
    if (!emailVal || !this.isValidEmail(emailVal)) {
      this.toastError('Please enter a valid Email Address');
      return false;
    }

    // 2. Phone Validation
    const phoneVal = isClinic ? data.clinicContact : data.phone;
    if (!phoneVal || phoneVal.toString().length < 10) {
      this.toastError('Please enter a valid 10-digit Phone Number');
      return false;
    }

    // 3. Password Validation (Fixed Ram@1434 issue)
    const passVal = isClinic ? data.clinicPassword : data.password;
    const confirmPassVal = data.confirmPassword;

    if (!passVal || passVal.length < 6) {
      this.toastError('Password must be at least 6 characters');
      return false;
    }

    if (passVal !== confirmPassVal) {
      this.toastError('Passwords do not match');
      return false;
    }

    // 4. Role Specific Validations
    if (isClinic) {
      if (!data.clinicName || data.clinicName.length < 3) {
        this.toastError('Clinic Name is required (min 3 chars)');
        return false;
      }
      if (!data.clinicCity) {
        this.toastError('City is required');
        return false;
      }
      if (!data.clinicAddress) {
        this.toastError('Full Address is required');
        return false;
      }
    } else {
      if (!data.fullName || data.fullName.length < 3) {
        this.toastError('Full Name is required');
        return false;
      }
      if (!data.dob) {
        this.toastError('Date of Birth is required');
        return false;
      }
    }

    // 5. Terms & Conditions
    if (!data.acceptTerms) {
      this.toastError('Please accept Terms & Conditions');
      return false;
    }

    return true;
  }

  private handleSuccess() {
    this.isLoading = false;
    Swal.fire('Success', 'Account Created Successfully!', 'success');
    this.router.navigate(['/login']);
  }
  private handleError(err: any) {
    this.isLoading = false;
    Swal.fire('Error', err.error?.message || 'Registration Failed.', 'error');
  }
  toastError(msg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: msg,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }
  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  registerWithGoogle() {
    console.log('Google Sign-up');
  }
  registerWithMicrosoft() {
    console.log('Microsoft Sign-up');
  }
  registerWithApple() {
    console.log('Apple Sign-up');
  }

  loadParticles() {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: { value: 260, density: { enable: true, value_area: 600 } },
          color: { value: '#ffffff' },
          shape: { type: 'circle' },
          opacity: {
            value: 1,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0, sync: false },
          },
          size: { value: 3, random: true },
          move: { enable: true, speed: 1, direction: 'none', out_mode: 'out' },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'bubble' },
            onclick: { enable: true, mode: 'repulse' },
          },
          modes: {
            bubble: { distance: 250, size: 0, opacity: 0 },
            repulse: { distance: 400 },
          },
        },
      });
    }
  }
}
