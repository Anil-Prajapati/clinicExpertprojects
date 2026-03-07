import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../core/core/services/auth.service';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // ─── Raw & Derived Data ───────────────────────────────────────
  doctorList:   any[] = [];   // full list from API — never mutated after load
  filteredList: any[] = [];   // after client-side filtering
  pagedList:    any[] = [];   // current page slice shown in table/cards

  // ─── Role ─────────────────────────────────────────────────────
  isAdmin = false;            // true = table view; false = cards view

  // ─── Loading ──────────────────────────────────────────────────
  isLoading = false;

  // ─── Filters (client-side, NO API call on change) ─────────────
  filterName   = '';
  filterSpec   = '';
  filterStatus = '';

  // ─── Pagination ───────────────────────────────────────────────
  currentPage = 1;
  pageSize    = 10;
  totalPages  = 1;

  // ─── Specialization options (populated dynamically) ───────────
  specializationOptions: string[] = [];

  // ─── Add / Edit Modal ─────────────────────────────────────────
  showModal = false;
  editMode  = false;
  isSaving  = false;
  modalData: any = {};
  clinicId: string | null = '';

  // ─── Delete Modal ─────────────────────────────────────────────
  showDeleteModal = false;
  deleteTarget: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public authService: AuthService,
    private location: Location,
    private router: Router,
    private ngZone: NgZone
  ) {}

  // ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => this.loadParticles());

      const token = localStorage.getItem('token');
      this.clinicId = localStorage.getItem('clinicId');

      if (!this.clinicId) {
          console.error('ClinicId not found in localStorage');
      }
      if (!token) {
        this.router.navigate(['/patient']);
        return;
      }

      const role = localStorage.getItem('userRole');
      this.isAdmin = role === 'ADMIN' || role === 'DOCTOR';

      this.getDoctorList();
    }
  }

  // ─── Load ALL doctors once ────────────────────────────────────
  getDoctorList(): void {
    this.isLoading = true;
    this.authService.getDoctorList().subscribe({
      next: (data: any[]) => {
        this.doctorList = data;
        console.log("Doctor List :",this.doctorList)
        // Build unique specialization dropdown from data
        const specs = [...new Set(data.map(d => d.doctorSpecialization).filter(Boolean))];
        this.specializationOptions = specs.sort();

        this.applyFilters();   // populates filteredList + pagedList
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.isLoading = false;
      }
    });
  }

  // ─── Client-side filter — NO API call ─────────────────────────
  applyFilters(): void {
    let result = [...this.doctorList];

    if (this.filterName.trim()) {
      const n = this.filterName.trim().toLowerCase();
      result = result.filter(d => d.fullName?.toLowerCase().includes(n));
    }
    if (this.filterSpec) {
      result = result.filter(d =>
        d.doctorSpecialization?.toLowerCase() === this.filterSpec.toLowerCase()
      );
    }
    if (this.filterStatus) {
      result = result.filter(d =>
        d.status?.toUpperCase() === this.filterStatus.toUpperCase()
      );
    }

    this.filteredList = result;
    this.currentPage  = 1;
    this.updatePagination();
  }

  // ─── Pagination helpers ───────────────────────────────────────
  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedList = this.filteredList.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  /** Smart page numbers with ellipsis. -1 = "···" placeholder */
  getPageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage, delta = 2;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [];
    const left  = Math.max(2, cur - delta);
    const right = Math.min(total - 1, cur + delta);
    pages.push(1);
    if (left > 2) pages.push(-1);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push(-1);
    pages.push(total);
    return pages;
  }

  // ─── Filter utils ─────────────────────────────────────────────
  hasActiveFilters(): boolean {
    return !!(this.filterName || this.filterSpec || this.filterStatus);
  }

  clearAllFilters(): void {
    this.filterName = '';
    this.filterSpec = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  // ─── Add Modal ────────────────────────────────────────────────
  openAddModal(): void {
    this.editMode  = false;
    this.modalData = { status: 'ACTIVE' };
    this.showModal = true;
  }

  // ─── Edit Modal ───────────────────────────────────────────────
  openEditModal(doctor: any): void {
    this.editMode  = true;
    this.modalData = { ...doctor };  // shallow copy so original isn't mutated
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.modalData = {};
    this.isSaving  = false;
  }

  // ─── Save (Add or Update) ─────────────────────────────────────
  saveDoctor(): void {
    if (!this.modalData.fullName?.trim() ||
        !this.modalData.doctorSpecialization?.trim() ||
        !this.modalData.doctorQualification?.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;

    if (this.editMode) {
      // ── UPDATE ──
      this.authService.updateDoctor(this.modalData.doctorId, this.modalData).subscribe({
        next: () => {
          // Update in-memory list so no re-fetch needed
          const idx = this.doctorList.findIndex(d => d.doctorId === this.modalData.doctorId);
          if (idx !== -1) this.doctorList[idx] = { ...this.modalData };
          this.applyFilters();
          this.closeModal();
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.isSaving = false;
        }
      });
    } else {

      if (!this.clinicId) {
        console.error('ClinicId not available');
         return;
      }
      this.authService.addDoctor(this.modalData,this.clinicId).subscribe({
        next: (newDoc) => {
          this.doctorList.unshift(newDoc); 
          this.applyFilters();
          this.closeModal();
        },
        error: (err) => {
          console.error('Add failed:', err);
          this.isSaving = false;
        }
      });
    }
  }

  // ─── Delete ───────────────────────────────────────────────────
  confirmDelete(doctor: any): void {
    this.deleteTarget  = doctor;
    this.showDeleteModal = true;
  }

  deleteDoctor(): void {
    if (!this.deleteTarget) return;
    this.authService.deleteDoctor(this.deleteTarget.doctorId).subscribe({
      next: () => {
        this.doctorList = this.doctorList.filter(
          d => d.doctorId !== this.deleteTarget.doctorId
        );
        this.applyFilters();
        this.showDeleteModal = false;
        this.deleteTarget = null;
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.showDeleteModal = false;
      }
    });
  }

  // ─── Patient: Book Appointment ───────────────────────────────
  onBookAppointment(doctor: any): void {
    this.router.navigate(['/appointment'], {
      state: { doctorId: doctor.doctorId, doctorName: doctor.fullName }
    });
  }

  // ─── Navigation ──────────────────────────────────────────────
  goBack(): void { this.location.back(); }

  // ─── Avatar color per initial ────────────────────────────────
  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #00f2fe, #4facfe)',
      'linear-gradient(135deg, #00c9ff, #92fe9d)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  }

  // ─── Particles ───────────────────────────────────────────────
  loadParticles(): void {
    particlesJS('particles-js', {
      particles: {
        number: { value: 360, density: { enable: true, value_area: 800 } },
        color: { value: ['#ffffff', '#4fc3f7', '#81c784', '#ffb74d'] },
        shape: { type: ['circle', 'star', 'triangle'], stroke: { width: 0, color: '#000000' }, polygon: { nb_sides: 5 } },
        opacity: { value: 0.8, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
        line_linked: { enable: true, distance: 150, color: '#4fc3f7', opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false, attract: { enable: true, rotateX: 600, rotateY: 1200 } },
      },
      interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: { grab: { distance: 200, line_linked: { opacity: 0.5 } }, push: { particles_nb: 4 } },
      },
      retina_detect: true,
    });
  }
}
