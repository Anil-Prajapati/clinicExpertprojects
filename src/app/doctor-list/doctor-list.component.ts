import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../core/core/services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
declare var particlesJS: any;

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css',
})
export class DoctorListComponent implements OnInit {
  doctorList: any[] = [];
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public authService: AuthService,
    private location: Location,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => this.loadParticles());
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/patient']);
        return;
      }
      this.getDoctorList();
    }
  }

  onBookAppointment(doctor: any) {
    this.router.navigate(['/appointment'], {
      state: {
        doctorId: doctor.doctorId,
        doctorName: doctor.fullName,
      },
    });
  }

  getDoctorList() {
    this.authService.getDoctorList().subscribe({
      next: (data) => {
        this.doctorList = data;
        console.log('Doctor List :', this.doctorList);
      },
      error(err) {
        console.error('Error:', err);
      },
    });
  }

  goBack() { this.location.back();}
  
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
}
