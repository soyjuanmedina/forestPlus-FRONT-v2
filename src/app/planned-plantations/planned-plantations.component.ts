import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-planned-plantations',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './planned-plantations.component.html',
  styleUrl: './planned-plantations.component.css'
})
export class PlannedPlantationsComponent implements OnInit {
  plantations: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPlantations();
  }

  loadPlantations() {
    this.loading = true;
    this.adminService.getPlannedPlantations().subscribe({
      next: (data) => {
        // En la vista de usuario solo mostramos las activas
        this.plantations = data.filter((p: any) => p.isActive);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
