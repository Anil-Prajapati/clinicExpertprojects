import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface Duration {
  name: string;
  discount: string | null;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css',
})
export class PlansComponent {
  userType: 'Clinics' | 'Startups' = 'Clinics';
  selectedDuration: string = 'Monthly';
  basicExtraUsers: number = 0;
  standardExtraUsers: number = 0;

  durations: Duration[] = [
    { name: 'Monthly', discount: null },
    { name: 'Quarterly', discount: '10% OFF' },
    { name: 'Yearly', discount: '20% OFF' }
  ];

  getBasicPrice(): number {
    const base = this.userType === 'Clinics' ? 99 : 149;
    if (this.selectedDuration === 'Quarterly') return Math.round(base * 0.9);
    if (this.selectedDuration === 'Yearly') return Math.round(base * 0.8);
    return base;
  }

  getStandardPrice(): number {
    const base = this.userType === 'Clinics' ? 199 : 249;
    if (this.selectedDuration === 'Quarterly') return Math.round(base * 0.9);
    if (this.selectedDuration === 'Yearly') return Math.round(base * 0.8);
    return base;
  }

  setUserType(type: 'Clinics' | 'Startups'): void {
    this.userType = type;
  }

  setDuration(duration: string): void {
    this.selectedDuration = duration;
  }
}
