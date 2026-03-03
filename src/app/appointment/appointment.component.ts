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
  role: string | null = '';
  appointmentsList: any[] = [];
  isLoading: boolean = false;
  filterName: string = '';
  filterDate: string = '';
  filterType: string = '';
  filterStatus: string = '';
  filteredList: any[] = [];

  currentPage: number = 1;
  pageSize: number = 10; // default 10 rows per page
  totalPages: number = 1;
  pagedList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('userRole');
      console.log('role: ', this.role);

      // Debugging Logs
      console.log('Current Role from LocalStorage:', this.role);

      if (
        this.role === 'ADMIN' ||
        this.role === 'DOCTOR' ||
        this.role === 'PATIENT'
      ) {
        console.log('Condition Matched! Calling loadAllAppointments...');
        this.loadAllAppointments();
      } else {
        console.warn('Condition Not Matched. Check if role is correct.');
        const state = window.history.state;
        if (state && state.doctorId) {
          this.doctorId = state.doctorId;
          this.doctorName = state.doctorName;
        }
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
  loadAllAppointments(): void {
    this.isLoading = true;

    console.log('Data Loading Start:');
    this.authService.findAllAppointments().subscribe({
      next: (data) => {
        this.appointmentsList = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fetch failed', err);
        this.isLoading = false;
        Swal.fire('Error', 'Could not load appointments', 'error');
      },
    });
  }

  getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2; // pages to show on each side of current

    if (total <= 7) {
      // show all pages when few
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    pages.push(1);
    if (left > 2) pages.push(-1); // left ellipsis
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push(-1); // right ellipsis
    pages.push(total);

    return pages;
  }
  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #4F46E5, #06B6D4)',
      'linear-gradient(135deg, #7C3AED, #EC4899)',
      'linear-gradient(135deg, #059669, #06B6D4)',
      'linear-gradient(135deg, #D97706, #EF4444)',
      'linear-gradient(135deg, #2563EB, #7C3AED)',
      'linear-gradient(135deg, #0891B2, #10B981)',
    ];
    if (!name) return colors[0];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  applyFilters(): void {
    let result = [...this.appointmentsList];

    if (this.filterName.trim()) {
      const name = this.filterName.trim().toLowerCase();
      result = result.filter((a) =>
        a.patientName?.toLowerCase().includes(name)
      );
    }

    if (this.filterDate) {
      result = result.filter((a) => a.appointmentDate === this.filterDate);
    }

    if (this.filterType) {
      result = result.filter(
        (a) =>
          a.appointmentType?.toLowerCase() === this.filterType.toLowerCase()
      );
    }

    if (this.filterStatus) {
      result = result.filter(
        (a) => a.status?.toUpperCase() === this.filterStatus.toUpperCase()
      );
    }

    this.filteredList = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredList.length / this.pageSize)
    );
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedList = this.filteredList.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }
  hasActiveFilters(): boolean {
    return !!(
      this.filterName ||
      this.filterDate ||
      this.filterType ||
      this.filterStatus
    );
  }

  clearAllFilters(): void {
    this.filterName = '';
    this.filterDate = '';
    this.filterType = '';
    this.filterStatus = '';
    this.filteredList = [...this.appointmentsList];
  }

  goBack(): void {
    this.location.back();
  }
}
