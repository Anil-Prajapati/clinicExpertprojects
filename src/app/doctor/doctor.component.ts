import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface ThemeColor {
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
  light: string;
}

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css',
})
export class DoctorComponent implements OnInit {
  public chart: any;
  isSidebarOpen = false;
  selectedTheme = 'ocean';

  themes: ThemeColor[] = [
    {
      name: 'ocean',
      primary: '#4e73df',
      secondary: '#224abe',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      light: 'rgba(78, 115, 223, 0.1)'
    },
    {
      name: 'sunset',
      primary: '#f093fb',
      secondary: '#f5576c',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      light: 'rgba(245, 87, 108, 0.1)'
    },
    {
      name: 'forest',
      primary: '#11998e',
      secondary: '#38ef7d',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      light: 'rgba(17, 153, 142, 0.1)'
    },
    {
      name: 'purple',
      primary: '#a044ff',
      secondary: '#6a3093',
      gradient: 'linear-gradient(135deg, #a044ff 0%, #6a3093 100%)',
      light: 'rgba(160, 68, 255, 0.1)'
    },
    {
      name: 'fire',
      primary: '#fa709a',
      secondary: '#fee140',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      light: 'rgba(250, 112, 154, 0.1)'
    }
  ];

  menuItems = [
    { label: 'Dashboard', icon: 'bi bi-grid-fill', active: true },
    { label: 'Appointments', icon: 'bi bi-calendar3', active: false },
    { label: 'Transactions', icon: 'bi bi-cash-stack', active: false },
    { label: 'My Schedule', icon: 'bi bi-clock', active: false },
    { label: 'Visits', icon: 'bi bi-person-badge', active: false },
    { label: 'Live Consultations', icon: 'bi bi-camera-video', active: false },
    { label: 'Holiday', icon: 'bi bi-calendar-x', active: false },
    { label: 'Medicines', icon: 'bi bi-capsule', active: false },
  ];

  stats = [
    { title: 'Total Appointments', value: '2', icon: 'bi-file-earmark-text', color: 'primary', bg: '#e3f2fd' },
    { title: 'Today Appointments', value: '0', icon: 'bi-calendar-check', color: 'success', bg: '#e8f5e9' },
    { title: 'Next Appointments', value: '0', icon: 'bi-calendar-plus', color: 'info', bg: '#e0f7fa' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.createChart();
        this.applyTheme();
      }, 0);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  changeTheme(themeName: string) {
    this.selectedTheme = themeName;
    this.applyTheme();
  }

  applyTheme() {
    const theme = this.themes.find(t => t.name === this.selectedTheme);
    if (theme) {
      document.documentElement.style.setProperty('--theme-primary', theme.primary);
      document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
      document.documentElement.style.setProperty('--theme-gradient', theme.gradient);
      document.documentElement.style.setProperty('--theme-light', theme.light);
    }
  }

  setActiveMenu(index: number) {
    this.menuItems.forEach((item, i) => {
      item.active = i === index;
    });
    if (window.innerWidth < 992) {
      this.isSidebarOpen = false;
    }
  }

  createChart() {
    const canvas = document.getElementById('appointmentChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0.2, 1, 1, 0.2, 0, 0, 0],
          fill: true,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            cornerRadius: 8,
            titleColor: '#fff',
            bodyColor: '#fff'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1.5,
            ticks: { stepSize: 0.5 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}
