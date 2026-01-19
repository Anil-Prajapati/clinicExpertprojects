import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css',
})
export class PlansComponent {
 userType = 'Startups'; // 'Clinics' or 'Startups'
  selectedDuration = 'Monthly';

  durations = [
    { name: 'Monthly', discount: '' },
    { name: 'Quarterly', discount: 'Save 8%' },
    { name: 'Semi-Annual', discount: 'Save 12%' },
    { name: 'Annual', discount: 'Save 18%' },
    { name: 'Triennial', discount: 'Save 30%' }
  ];

  // Hardcoded Data based on your images
  pricingTable: any = {
    'Clinics': {
      'Monthly': { basic: 150, standard: 300 },
      'Annual': { basic: 120, standard: 240 }
    },
    'Startups': {
      'Monthly': { basic: 175, standard: 350 },
      'Annual': { basic: 143, standard: 287 },
      'Triennial': { basic: 122, standard: 245 }
    }
  };

  getBasicPrice() {
    return this.pricingTable[this.userType][this.selectedDuration]?.basic || 100;
  }

  getStandardPrice() {
    return this.pricingTable[this.userType][this.selectedDuration]?.standard || 200;
  }
}