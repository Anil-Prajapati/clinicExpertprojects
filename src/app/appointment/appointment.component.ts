import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../core/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent implements OnInit {
  appointmentForm!: FormGroup;
  showQR: boolean = true;
  doctorId!: string;
  clinicId!: string;
  doctorName!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.showQR = true;

      const state = window.history.state;

      if (state && state.doctorId) {
        this.doctorId = state.doctorId;
        this.doctorName = state.doctorName;
      } else {
        console.error(
          'Data not found in state! Check DoctorList component navigation.'
        );
      }
    }

    this.appointmentForm = this.fb.group({
      patientName: [''],
      patientContact: [''],
      gender: ['Male'],
      appointmentDate: [''],
      hour: [''],
      minute: [''],
      appointmentType: ['New'],
    });
  }
  submit(): void {
    const form = this.appointmentForm.value;
    if (!this.doctorId) {
      Swal.fire(
        'Error',
        'Doctor selection missing. Please try again.',
        'error'
      );
      return;
    }
    const hourStr = String(form.hour || '00').padStart(2, '0');
    const minuteStr = String(form.minute || '00').padStart(2, '0');
    const formattedTime = `${hourStr}:${minuteStr}:00`;

    if (!form.appointmentDate) {
      Swal.fire('Error', 'Please select a valid date.', 'warning');
      return;
    }

    const payload = {
      patientName: form.patientName,
      patientContact: form.patientContact,
      gender: form.gender,
      clinicId: null, 
      doctorId: this.doctorId,
      appointmentDate: form.appointmentDate, 
      timeSlot: formattedTime,
      appointmentType: form.appointmentType,
      status: 'PENDING',
    };

    console.log('🚀 Sending Validated Payload:', payload);

    this.authService.bookAppointmentRegistration(payload).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Appointment Booked 🎉', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        const errorMsg =
          err.error?.message ||
          'Server Error (500). Please check if all fields are filled.';
        Swal.fire('Booking Failed', errorMsg, 'error');
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
