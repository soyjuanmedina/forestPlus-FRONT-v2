import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { DashboardControllerService, HomeDashboardKpiResponseDto } from '../api';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';

@Component( {
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
} )
export class DashboardComponent implements OnInit {
  user: any;
  kpis: HomeDashboardKpiResponseDto | null = null;
  loading = true;

  // Factores de equivalencia v1
  readonly CAR_FACTOR = 120;   // 120g CO2 por km = 0.12kg/km
  readonly PLANE_FACTOR = 100; // 100g CO2 por km = 0.10kg/km
  readonly HOME_FACTOR = 1800; // 1.8 Toneladas por hogar/año

  constructor (
    private authService: AuthService,
    private dashboardApi: DashboardControllerService,
    private router: Router
  ) { }

  ngOnInit (): void {
    this.user = this.authService.getCurrentUser();

    if ( this.user?.forcePasswordChange ) {
      this.router.navigate( ['/profile'], { queryParams: { mustChange: 'true' } } );
      return;
    }

    this.loadKpis();
  }

  loadKpis () {
    this.loading = true;
    this.dashboardApi.getHomeKpis().subscribe( {
      next: ( data ) => {
        this.kpis = data;
        this.loading = false;
      },
      error: ( err ) => {
        console.error( 'Error fetching KPIs', err );
        this.loading = false;
      }
    } );
  }

  // Calculos de impacto
  getCarKm ( co2: number ): number {
    if ( !co2 ) return 0;
    return Math.round( co2 / ( this.CAR_FACTOR / 1000 ) );
  }

  getPlaneKm ( co2: number ): number {
    if ( !co2 ) return 0;
    return Math.round( co2 / ( this.PLANE_FACTOR / 1000 ) );
  }

  getHomePercent ( co2: number ): number {
    if ( !co2 ) return 0;
    const value = ( co2 / this.HOME_FACTOR ) * 100;
    return parseFloat( value.toFixed( 1 ) );
  }

  getHomesCount ( co2: number ): string {
    if ( !co2 ) return "0";
    const value = co2 / this.HOME_FACTOR;
    return value.toFixed( 1 );
  }
}
