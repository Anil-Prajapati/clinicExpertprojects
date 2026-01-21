import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
declare var particlesJS: any;
@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent implements OnInit{
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  registerData = {
    fullName: '',
    email: '',
    phone: '',
    clinicName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadParticles();
    }
  }
  // NASA Particles - Exact configuration
  loadParticles(): void {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 160,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: '#ffffff',
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#4fc3f7',
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 1,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 4,
            size_min: 0.3,
            sync: false,
          },
        },
        line_linked: {
          enable: false, // NASA effect mein lines nahi hai
          distance: 150,
          color: '#ffffff',
          opacity: 0.4,
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
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 600,
          },
        },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'bubble',
          },
          onclick: {
            enable: true,
            mode: 'repulse',
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 250,
            size: 0,
            duration: 2,
            opacity: 0,
            speed: 3,
          },
          repulse: {
            distance: 400,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(): void {
    if (this.validateRegistration()) {
      console.log('Register Data:', this.registerData);
      alert('Registration successful! Redirecting to login...');
      this.router.navigate(['/login']);
    }
  }

  validateRegistration(): boolean {
    if (
      !this.registerData.fullName ||
      this.registerData.fullName.trim().length < 3
    ) {
      alert('Please enter your full name (minimum 3 characters)');
      return false;
    }

    if (!this.registerData.email) {
      alert('Please enter your email address');
      return false;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (
      this.registerData.phone &&
      !this.isValidPhone(this.registerData.phone)
    ) {
      alert('Please enter a valid phone number');
      return false;
    }

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

    if (!this.registerData.confirmPassword) {
      alert('Please confirm your password');
      return false;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Passwords do not match');
      return false;
    }

    if (!this.registerData.acceptTerms) {
      alert('Please accept the terms and conditions');
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  }

  registerWithGoogle(): void {
    console.log('Google Registration');
  }

  registerWithMicrosoft(): void {
    console.log('Microsoft Registration');
  }

  registerWithApple(): void {
    console.log('Apple Registration');
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}