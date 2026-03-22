import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { DashboardControllerService, HomeDashboardKpiResponseDto } from '../api';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
<div class="dashboard-page animate-fade-in">
  <!-- WELCOME HEADER -->
  <div class="welcome-hero-v2 animate-slide-up">
    <h1>{{ 'DASHBOARD.WELCOME' | translate:{name: user?.name} }}</h1>
    <p>{{ 'DASHBOARD.PANEL' | translate }}</p>
  </div>

  <div *ngIf="loading" class="dashboard-loader">
      <div class="spinner"></div>
      <p>{{ 'ADMIN_PAGE.LOADING' | translate }}</p>
  </div>

  <div *ngIf="!loading && kpis" class="dashboard-impact-grid">
    
    <!-- TU CONTRIBUCIÓN -->
    <div class="impact-section animate-slide-up delay-1">
      <h2 class="impact-title">{{ 'DASHBOARD.STATS.YOUR_CONTRIBUTION' | translate | uppercase }}</h2>
      <div class="main-card glass primary-border">
        <div class="main-stat">
          <span class="value">{{ kpis.plantedTrees || 0 }}</span>
          <span class="label">{{ 'DASHBOARD.STATS.PLANTED' | translate }}</span>
        </div>
        
        <div class="impact-stats">
          <div class="impact-label">{{ 'DASHBOARD.STATS.ENVIRONMENTAL_IMPACT' | translate }}</div>
          <div class="co2-value">{{ kpis.annualCo2Compensated || 0 }} <small>kg CO₂ / año</small></div>
          
          <div class="congrats-text">{{ 'DASHBOARD.STATS.CONGRATS_PERSONAL' | translate }}</div>
          
          <div class="equivalence-grid">
            <div class="eq-item">
              <span class="icon">🚗</span>
              <span class="val">{{ getCarKm(kpis.annualCo2Compensated || 0) | number }} <small>km en coche</small></span>
            </div>
            <div class="eq-item">
              <span class="icon">✈️</span>
              <span class="val">{{ getPlaneKm(kpis.annualCo2Compensated || 0) | number }} <small>km en avión</small></span>
            </div>
            <div class="eq-item">
              <span class="icon">🏠</span>
              <span class="val">{{ getHomePercent(kpis.annualCo2Compensated || 0) }}% <small>de un hogar / año</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NUESTRO PROYECTO -->
    <div class="impact-section animate-slide-up delay-2">
      <h2 class="impact-title">{{ 'DASHBOARD.STATS.OUR_PROJECT' | translate | uppercase }}</h2>
      <div class="main-card glass secondary-border">
        <div class="main-stat">
          <span class="value">{{ kpis.globalPlantedTrees || 0 | number }}</span>
          <span class="label">{{ 'DASHBOARD.STATS.PLANTED' | translate }}</span>
        </div>
        
        <div class="impact-stats">
          <div class="impact-label">{{ 'DASHBOARD.STATS.ENVIRONMENTAL_IMPACT' | translate }}</div>
          <div class="co2-value">{{ kpis.globalAnnualCo2Compensated || 0 | number }} <small>kg CO₂ / año</small></div>
          
          <div class="congrats-text">{{ 'DASHBOARD.STATS.CONGRATS_GLOBAL' | translate }}</div>
          
          <div class="equivalence-grid">
            <div class="eq-item">
              <span class="icon">🚗</span>
              <span class="val">{{ getCarKm(kpis.globalAnnualCo2Compensated || 0) | number }} <small>km en coche</small></span>
            </div>
            <div class="eq-item">
              <span class="icon">✈️</span>
              <span class="val">{{ getPlaneKm(kpis.globalAnnualCo2Compensated || 0) | number }} <small>km en avión</small></span>
            </div>
            <div class="eq-item">
              <span class="icon">🏠</span>
              <span class="val">{{ getHomesCount(kpis.globalAnnualCo2Compensated || 0) }} <small>hogares / año</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PRÓXIMA PLANTACIÓN -->
    <div class="impact-section animate-slide-up delay-3 full-row">
      <h2 class="impact-title">{{ 'DASHBOARD.STATS.NEXT_PLANTATION' | translate | uppercase }}</h2>
      
      <div *ngIf="kpis.plannedPlantations?.length" class="next-event-board glass">
        <div *ngFor="let pp of kpis.plannedPlantations | slice:0:1" class="event-featured">
            <div class="event-name">{{ pp.plantationName }}</div>
            
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="((pp.soldTrees || 0) / (pp.maxTrees || 1)) * 100"></div>
              </div>
              <div class="progress-stats">
                <strong>{{ pp.soldTrees || 0 }} / {{ pp.maxTrees || 0 }}</strong>
                <span>{{ 'DASHBOARD.STATS.PLANTED' | translate }}</span>
              </div>
            </div>

            <div class="event-actions">
              <a [routerLink]="['/lands']" class="btn btn-primary">{{ 'DASHBOARD.STEPS.CTA' | translate }}</a>
            </div>
        </div>
      </div>

      <div *ngIf="!kpis.plannedPlantations?.length" class="empty-upcoming glass">
          <i class="fa-solid fa-leaf"></i>
          <p>{{ 'PLANNED_PLANTATION.SEARCH_NOT_FOUND' | translate }}</p>
      </div>
    </div>
  </div>
</div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any;
  kpis: HomeDashboardKpiResponseDto | null = null;
  loading = true;

  // Factores de equivalencia v1
  readonly CAR_FACTOR = 120;   // 120g CO2 por km = 0.12kg/km
  readonly PLANE_FACTOR = 100; // 100g CO2 por km = 0.10kg/km
  readonly HOME_FACTOR = 1800; // 1.8 Toneladas por hogar/año

  constructor(
    private authService: AuthService, 
    private dashboardApi: DashboardControllerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('--- V2 IMPACT DASHBOARD ACTIVE - REPLICATION IN PROGRESS ---');
    this.user = this.authService.getCurrentUser();
    
    if (this.user?.forcePasswordChange) {
      this.router.navigate(['/profile'], { queryParams: { mustChange: 'true' } });
      return;
    }

    this.loadKpis();
  }

  loadKpis() {
    this.loading = true;
    this.dashboardApi.getHomeKpis().subscribe({
      next: (data) => {
        this.kpis = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching KPIs', err);
        this.loading = false;
      }
    });
  }

  // Calculos de impacto
  getCarKm(co2: number): number {
    if (!co2) return 0;
    return Math.round(co2 / (this.CAR_FACTOR / 1000));
  }

  getPlaneKm(co2: number): number {
    if (!co2) return 0;
    return Math.round(co2 / (this.PLANE_FACTOR / 1000));
  }

  getHomePercent(co2: number): number {
    if (!co2) return 0;
    const value = (co2 / this.HOME_FACTOR) * 100;
    return parseFloat(value.toFixed(1));
  }

  getHomesCount(co2: number): string {
    if (!co2) return "0";
    const value = co2 / this.HOME_FACTOR;
    return value.toFixed(1);
  }
}
