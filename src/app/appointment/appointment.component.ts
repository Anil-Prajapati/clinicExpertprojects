import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent {
  appointmentForm!: FormGroup;
  showQR: boolean = true;
  doctors = [
    { id: 1, name: 'Dr. A' },
    { id: 2, name: 'Dr. B' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.showQR = !this.route.snapshot.queryParamMap.has('scan');

    this.appointmentForm = this.fb.group({
      patientName: [''],
      phone: [''],
      gender: [''],
      age: [''],
      doctor: [''],
      date: [''],
      time: [''],
      visitType: ['New'],
    });
  }

  submit() {
    console.log(this.appointmentForm.value);
  }
}
