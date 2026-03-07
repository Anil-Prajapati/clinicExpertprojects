import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../core/core/services/auth.service';
import Swal from 'sweetalert2';

export interface Appointment {
  patientName: string;
  patientContact: string;
  gender: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: string;
  status: string;
  patient: {
    patientId: string;
  };
  doctor: {
    doctorId: string;
  };
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent implements OnInit {
  appointmentForm!: FormGroup;
  doctorId: string = '';
  clinicId: string = '';
  doctorName: string = '';
  role: string | null = '';
  appointmentsList: any[] = [];
  isLoading: boolean = false;

  filterName: string = '';
  filterDate: string = '';
  filterType: string = '';
  filterStatus: string = '';
  filteredList: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pagedList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      const state = nav.extras.state as any;
      this.doctorId = state.doctorId || '';
      this.doctorName = state.doctorName || '';
      this.clinicId = state.clinicId || '';
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('userRole');
      const today = new Date();
      this.filterDate = today.toISOString().split('T')[0];
      const savedPatientId = localStorage.getItem('patientId') || '';
      const savedClinicId =
        this.clinicId || localStorage.getItem('clinicId') || '';

      this.initForm(savedPatientId, savedClinicId);

      if (this.role === 'ADMIN' || this.role === 'DOCTOR') {
        this.loadAllAppointments();
      }
    }
  }

  initForm(pId: string, cId: string) {
    this.appointmentForm = this.fb.group({
      clinicId: [{ value: cId, disabled: true }],
      patientId: [{ value: pId, disabled: true }],
      doctorId: [{ value: this.doctorId, disabled: true }],
      patientName: ['', Validators.required],
      patientContact: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10,12}$')],
      ],
      gender: ['Male', Validators.required],
      appointmentDate: ['', Validators.required],
      hour: ['', [Validators.required, Validators.min(0), Validators.max(23)]],
      minute: [
        '',
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      appointmentType: ['New', Validators.required],
    });
  }

  submit(): void {
    if (this.appointmentForm.invalid) {
      Swal.fire('Warning', 'Please fill all required fields.', 'warning');
      return;
    }
    const form = this.appointmentForm.getRawValue();
    const hourStr = String(form.hour).padStart(2, '0');
    const minStr = String(form.minute).padStart(2, '0');
    const formattedTimeSlot = `${hourStr}:${minStr}:00`;

    const payload = {
      patientName: form.patientName,
      patientContact: form.patientContact,
      gender: form.gender,
      appointmentDate: form.appointmentDate,
      timeSlot: formattedTimeSlot,
      appointmentType: form.appointmentType,
      status: 'PENDING',
      patient: {
        patientId: form.patientId,
      },
      doctor: {
        doctorId: form.doctorId || this.doctorId,
      },
      clinic: {
        clinicId: form.clinicId || this.clinicId,
      },
    };

    console.log('Sending Payload to Spring Boot:', payload);

    this.isLoading = true;
    this.authService.bookAppointmentRegistration(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire(
          'Success',
          'Appointment Booked & Notification Sent! 🎉',
          'success'
        );
        this.router.navigate(['/patient']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Server Error:', err);
        Swal.fire(
          'Error',
          err.error?.message || 'Server Error: Check if IDs are valid',
          'error'
        );
      },
    });
  }

  loadAllAppointments(): void {
    this.isLoading = true;
    this.authService.findAllAppointments().subscribe({
      next: (data) => {
        this.appointmentsList = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    let result = [...this.appointmentsList];
    if (this.filterName.trim()) {
      result = result.filter((a) =>
        a.patientName?.toLowerCase().includes(this.filterName.toLowerCase())
      );
    }
    if (this.filterDate)
      result = result.filter((a) => a.appointmentDate === this.filterDate);
    if (this.filterType)
      result = result.filter((a) => a.appointmentType === this.filterType);
    if (this.filterStatus)
      result = result.filter((a) => a.status === this.filterStatus);

    this.filteredList = result;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredList.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedList = this.filteredList.slice(start, start + this.pageSize);
  }
  goToPage(p: number) {
    this.currentPage = p;
    this.updatePagination();
  }
  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }
  hasActiveFilters = () =>
    !!(
      this.filterName ||
      this.filterDate ||
      this.filterType ||
      this.filterStatus
    );
  clearAllFilters() {
    this.filterName = '';
    this.filterDate = '';
    this.filterType = '';
    this.filterStatus = '';
    this.applyFilters();
  }
  goBack(): void {
    this.location.back();
  }
  getAvatarColor(name: string): string {
    return 'linear-gradient(135deg, #4F46E5, #06B6D4)';
  }
  getPageNumbers = () =>
    Array.from({ length: this.totalPages }, (_, i) => i + 1);
}
