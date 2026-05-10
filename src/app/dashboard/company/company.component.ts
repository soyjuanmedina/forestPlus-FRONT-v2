import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../services/company.service';
import { CompanyCo2Service } from '../../services/company-co2.service';
import { CompanyResponseDto, CompanyCO2YearlyResponseDto, TreeControllerService, TreeResponseDto } from '../../api';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { AssignTreesModalComponent } from '../../modals/assign-trees-modal/assign-trees-modal.component';
import { TreeService } from '../../services/tree.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component( {
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, StatusModalComponent, AssignTreesModalComponent],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css'
} )
export class CompanyComponent implements OnInit {
  private route = inject( ActivatedRoute );
  private companyService = inject( CompanyService );
  private companyCo2Service = inject( CompanyCo2Service );
  private treeApi = inject( TreeControllerService );
  private treeService = inject( TreeService );
  private translate = inject( TranslateService );
  private authService = inject( AuthService );

  companyId?: number;
  company?: CompanyResponseDto;
  trees: TreeResponseDto[] = [];
  co2Records: CompanyCO2YearlyResponseDto[] = [];
  loading = true;
  stats = { totalTrees: 0, totalCo2: 0 };
  isAdmin = false;

  // Factores de equivalencia unificados
  readonly CAR_FACTOR = 120;   // 120g CO2 por km = 0.12kg/km
  readonly PLANE_FACTOR = 100; // 100g CO2 por km = 0.10kg/km
  readonly HOME_FACTOR = 1800; // 1.8 Toneladas por hogar/año

  features = environment.features;

  getCarKm ( co2: number ): number {
    if ( !co2 ) return 0;
    return Math.round( co2 / ( this.CAR_FACTOR / 1000 ) );
  }

  getPlaneKm ( co2: number ): number {
    if ( !co2 ) return 0;
    return Math.round( co2 / ( this.PLANE_FACTOR / 1000 ) );
  }

  getHomesCount ( co2: number ): number {
    if ( !co2 ) return 0;
    return co2 / this.HOME_FACTOR;
  }

  showingAssignModal = false;
  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  ngOnInit () {
    const role = this.authService.getRole();
    this.isAdmin = role === 'ADMIN' || role === 'COMPANY_ADMIN';

    this.route.paramMap.subscribe( params => {
      const idParam = params.get( 'id' );
      if ( idParam ) {
        this.companyId = Number( idParam );
        this.loadAllData( this.companyId );
      } else {
        this.loading = false;
      }
    } );
  }

  loadAllData ( id: number ) {
    this.loading = true;

    forkJoin( {
      company: this.companyService.getCompanyById( id ).pipe( catchError( err => {
        console.error( 'Error info empresa:', err );
        return of( null );
      } ) ),
      trees: this.treeApi.getAllTreesByOwner( undefined, id ).pipe( catchError( err => {
        console.error( 'Error árboles empresa:', err );
        return of( [] );
      } ) )
    } ).subscribe( {
      next: ( res ) => {
        this.company = res.company || undefined;
        this.trees = res.trees || [];
        this.co2Records = ( this.company?.co2 || [] ).sort( ( a, b ) => ( b.year || 0 ) - ( a.year || 0 ) );

        // Calcular estadísticas
        this.stats.totalTrees = this.trees.length;
        
        // Si hay registros históricos, los usamos. Si no, calculamos el CO2 en tiempo real de los árboles actuales
        if (this.co2Records.length > 0) {
          this.stats.totalCo2 = this.co2Records.reduce((acc, curr) => acc + (curr.totalCompensations || 0), 0);
        } else {
          // Suma de la absorción a los 20 años de todos los árboles de la compañía
          this.stats.totalCo2 = this.trees.reduce((acc, tree) => acc + (tree.co2AbsorptionAt20 || 0), 0);
        }

        this.loading = false;

        if ( !this.company ) {
          this.showStatus( 'error', 'No encontrado', 'No se ha podido cargar la información de esta compañía.' );
        }
      },
      error: ( err ) => {
        console.error( 'Error crítico en forkJoin:', err );
        this.loading = false;
        this.showStatus( 'error', 'Error', 'Error al sincronizar los datos de la compañía.' );
      }
    } );
  }

  onCompanyLogoError () {
    console.error( 'El logo de la compañía no se pudo cargar' );
    if ( this.company ) {
      console.error( 'El logo de la compañía no se pudo cargar', this.company.picture );
      this.company.picture = undefined;
    }
  }

  openAssignModal () {
    this.showingAssignModal = true;
  }

  closeAssignModal () {
    this.showingAssignModal = false;
  }

  onTreesAssigned ( payload: any ) {
    this.treeService.plantTreeBatch( payload ).subscribe( {
      next: () => {
        this.showingAssignModal = false;
        this.showStatus( 'success', 'Éxito', this.translate.instant( 'ASSIGN_TREES.SUCCESS' ) );
        if ( this.companyId ) this.loadAllData( this.companyId );
      },
      error: ( err ) => {
        this.showStatus( 'error', 'Error', err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
      }
    } );
  }

  showStatus ( type: 'success' | 'error', title: string, message: string ) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus () {
    this.statusModal.visible = false;
  }

  get netCo2Records () {
    return this.co2Records.map( r => ( {
      ...r,
      net: ( r.totalEmissions || 0 ) - ( r.totalCompensations || 0 )
    } ) );
  }
}
