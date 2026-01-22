import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Models
interface StatCard {title: string; value: string; icon: string;}
interface Appointment {id: number; doctorName: string; doctorImage: string; type: string; time: string;}
interface PaymentHistory {id: number; service: string; amount: string; date: string;}
interface Doctor {id: number; name: string; specialty: string; image: string;}
interface RevenueData {date: string; income: number; expense: number;}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  searchText = '';
  isSidebarOpen = false; // Fixed: Using single variable for sidebar state
  selectedDate = 'Thursday December 1st 2022';
  
  statCards: StatCard[] = [
    { title: 'Total Patients', value: '1,548', icon: 'people' },
    { title: 'Consultation', value: '448', icon: 'chat-dots' },
    { title: 'Staff', value: '848', icon: 'person-badge' },
    { title: 'Total Rooms', value: '3,100', icon: 'building' }
  ];
  
  dailyRevenue = {current: '₹32,485', previous: '₹12,458'};
  
  revenueData: RevenueData[] = [
    { date: '10 May', income: 80, expense: 70 },
    { date: '11 May', income: 85, expense: 65 },
    { date: '12 May', income: 95, expense: 75 },
    { date: '13 May', income: 100, expense: 80 },
    { date: '14 May', income: 90, expense: 85 },
    { date: '15 May', income: 110, expense: 95 },
    { date: '16 May', income: 105, expense: 100 }
  ];
  
  paymentHistory: PaymentHistory[] = [
    { id: 1, service: 'Kidney function test', amount: '₹ 25.15', date: 'Sunday, 16 May' },
    { id: 2, service: 'Emergency appointment', amount: '₹ 99.15', date: 'Sunday, 16 May' },
    { id: 3, service: 'Complementation test', amount: '₹ 40.45', date: 'Sunday, 16 May' }
  ];
  
  appointments: Appointment[] = [
    { id: 1, doctorName: 'Dr. Sarah Johnson', doctorImage: 'assets/doctor1.jpg', type: 'Emergency appointment', time: '10:00' },
    { id: 2, doctorName: 'Dr. Michael Chen', doctorImage: 'assets/doctor2.jpg', type: 'USG + Consultation', time: '10:30' },
    { id: 3, doctorName: 'Dr. Emily White', doctorImage: 'assets/doctor3.jpg', type: 'Laboratory screening', time: '11:00' },
    { id: 4, doctorName: 'Dr. James Wilson', doctorImage: 'assets/doctor4.jpg', type: 'Keeping pregnant', time: '11:30' }
  ];
  
  doctors: Doctor[] = [
    { id: 1, name: 'Dr. Shobha Dhaka', specialty: 'Dentist', image: 'assets/doctor1.jpg' },
    { id: 2, name: 'Dr. Navreen Kaur', specialty: 'Oculist', image: 'assets/doctor2.jpg' },
    { id: 3, name: 'Dr. Anjali Monga', specialty: 'Surgeon', image: 'assets/doctor3.jpg' }
  ];
  
  balance = {income: '₹142K', outcome: '₹43K'};
  appointmentStats = { male: 35, female: 30, child: 20, germany: 15};
  
  dateOptions = [
    { day: 'Tue', date: '29th', isActive: false },
    { day: 'Wed', date: '30th', isActive: false },
    { day: 'Thursday', date: 'December 1st 2022', isActive: true },
    { day: 'Fri', date: '2nd', isActive: false }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('Dashboard data loaded');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen);
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  getMaxValue(): number {
    const values = this.revenueData.flatMap(d => [d.income, d.expense]);
    return Math.max(...values);
  }

  getBarHeight(value: number): number {
    const maxValue = this.getMaxValue();
    return (value / maxValue) * 100;
  }

  selectDate(index: number): void {
    this.dateOptions.forEach((option, i) => {
      option.isActive = i === index;
    });
    this.selectedDate = this.dateOptions[index].date;
  }

  navigateDate(direction: 'prev' | 'next'): void {
    const currentIndex = this.dateOptions.findIndex(d => d.isActive);
    if (direction === 'prev' && currentIndex > 0) {
      this.selectDate(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < this.dateOptions.length - 1) {
      this.selectDate(currentIndex + 1);
    }
  }

  callDoctor(appointment: Appointment): void {
    console.log('Calling doctor for appointment:', appointment);
    alert(`Calling ${appointment.doctorName} for ${appointment.type}`);
  }

  viewPaymentDetails(payment: PaymentHistory): void {
    console.log('Payment details:', payment);
  }

  viewDoctorDetails(doctor: Doctor): void {
    console.log('Doctor details:', doctor);
  }

  onSearch(): void {
    console.log('Searching for:', this.searchText);
  }

  openNotifications(): void {
    console.log('Opening notifications');
  }

  openSettings(): void {
    console.log('Opening settings');
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  makeAppointment(): void {
    console.log('Make appointment clicked');
    alert('Opening appointment booking form...');
  }

  openChat(): void {
    console.log('Opening chat');
    alert('Chat feature coming soon!');
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  getAppointmentCount(): number {
    return this.appointments.length;
  }

  getTotalRevenue(): number {
    return this.revenueData.reduce((sum, data) => sum + data.income, 0);
  }

  getTotalExpenses(): number {
    return this.revenueData.reduce((sum, data) => sum + data.expense, 0);
  }

  getProfit(): number {
    return this.getTotalRevenue() - this.getTotalExpenses();
  }
}