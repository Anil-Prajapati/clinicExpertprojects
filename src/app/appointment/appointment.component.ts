import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {FormBuilder,FormGroup,FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent  implements OnInit{
  appointmentForm!: FormGroup;
  showQR: boolean = true;
  doctors = [
    { id: 1, name: 'Dr. A' },
    { id: 2, name: 'Dr. B' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute,private router: Router,private location: Location) {}

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

  submit() {console.log(this.appointmentForm.value);}
  goBack(): void {this.location.back();}
}
