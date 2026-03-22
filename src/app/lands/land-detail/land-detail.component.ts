import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TreeService } from '../../services/tree.service';
import { AdminService } from '../../services/admin.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-land-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './land-detail.component.html',
  styleUrl: './land-detail.component.css'
})
export class LandDetailComponent implements OnInit {
  land: any;
  loading = true;
  error = false;
  plannedPlantations: any[] = [];
  loadingPlantations = false;

  constructor (
    private route: ActivatedRoute,
    private treeService: TreeService,
    private adminService: AdminService
  ) { }

  ngOnInit () {
    this.route.paramMap.subscribe( params => {
      const id = params.get( 'id' );
      if ( id ) {
        const idNum = +id;
        this.loadLand( idNum );
        this.loadPlannedPlantations( idNum );
      } else {
        this.error = true;
        this.loading = false;
      }
    } );
  }

  loadLand ( id: number ) {
    this.loading = true;
    this.treeService.getLand( id ).subscribe( {
      next: ( data ) => {
        this.land = data;
        this.loading = false;
      },
      error: ( err ) => {
        console.error( 'Error fetching land details', err );
        this.error = true;
        this.loading = false;
      }
    } );
  }

  loadPlannedPlantations ( landId: number ) {
    this.loadingPlantations = true;
    this.adminService.getPlannedPlantationsByLand( landId ).subscribe( {
      next: ( data ) => {
        // Mostramos solo las marcadas como activas para los usuarios
        this.plannedPlantations = data.filter( ( p: any ) => p.isActive );
        this.loadingPlantations = false;
      },
      error: ( err ) => {
        console.error( 'Error fetching planned plantations', err );
        this.loadingPlantations = false;
        this.plannedPlantations = [];
      }
    } );
  }
}
