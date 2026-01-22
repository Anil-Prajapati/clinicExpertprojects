import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
declare var particlesJS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  
})
export class HomeComponent implements OnInit{

  constructor(@Inject(DOCUMENT) private doc: Document,@Inject(PLATFORM_ID) private platformId: any) {}
  activeTheme: string = 'blue';
  showTheme = false;

  themes: Record<string, { primary: string; gradient: string; light: string }> =
    {
      blue: {primary: '#2563eb',gradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',light: '#dbeafe',},
      green: {primary: '#16a34a',gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',light: '#dcfce7',},
      purple: {primary: '#9333ea',gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',light: '#f3e8ff',},
      orange: {primary: '#ea580c',gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',light: '#ffedd5',},
    };

  features = [
    {icon: 'calendar',title: 'Appointment Scheduling',desc: 'Effortlessly manage patient appointments',},
    {icon: 'file-text',title: 'Electronic Health Records',desc: 'Secure digital patient records',},
    {icon: 'dollar-sign',title: 'Billing & Invoicing',desc: 'Automated billing and payment tracking',},
    {icon: 'package',title: 'Inventory Management',desc: 'Track medical supplies and inventory',},
    {icon: 'message-square',title: 'Patient Communication',desc: 'SMS and email notifications',},
    {icon: 'bar-chart',title: 'Analytics & Reporting',desc: 'Insightful data and reports',},];

  benefits = [
    {icon: 'clock',title: 'Save Time & Increase Efficiency',desc: 'Streamline workflows to spend less time on admin tasks and more time caring for patients.',},
    {icon: 'heart',title: 'Enhance Patient Care',desc: 'Maintain comprehensive health records and optimize appointment scheduling to offer a smoother, more personalized patient experience.',},
    {icon: 'shield',title: 'Secure & Compliant',desc: 'Our software is fully compliant with data protection regulations, ensuring patient data is safe and secure.',},
    {icon: 'users',title: 'Adaptable for All Clinic Sizes',desc: "Whether you're a solo practitioner or part of a multi-specialty clinic, our software is built to scale and grow with your practice.",},];

  whyChoose = ['Multi-Doctor and Multi-Location Management','Easy to Use','Assistive Approach','Data Privacy','30 Days Free',];
  changeTheme(theme: string): void {
    this.activeTheme = theme;
    this.doc.documentElement.style.setProperty('--primary-color',this.themes[theme].primary);
    this.doc.documentElement.style.setProperty('--gradient-bg',this.themes[theme].gradient);
    this.doc.documentElement.style.setProperty('--light-bg',this.themes[theme].light);
  }
  toggleTheme() {
  this.showTheme = !this.showTheme; // open/close via icon
}

selectTheme(theme: string) {
  this.changeTheme(theme); 
  this.showTheme = false; 
}

 loadParticles(): void {
    particlesJS('particles-js', {
      particles: {
        number: { value: 160, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#ffffff',
          opacity: 0.4,
          width: 1
        },
        move: { enable: true, speed: 2 }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' }
        }
      }
    });
  }

  ngOnInit(): void {
     if (isPlatformBrowser(this.platformId)) { 
       this.loadParticles();
       this.changeTheme(this.activeTheme);
    }
  }
}
