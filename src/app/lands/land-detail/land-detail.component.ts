import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TreeService } from '../../services/tree.service';
import { AdminService } from '../../services/admin.service';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';
 
// Configuración de iconos de Leaflet para evitar errores en producción
const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
const iconUrl = 'assets/leaflet/marker-icon.png';
const shadowUrl = 'assets/leaflet/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

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
  private map: any;

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
        
        if (this.land.coordinates && this.land.coordinates.length >= 3) {
          setTimeout(() => this.initMap(), 500);
        }
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
 
  private initMap(): void {
    if (!this.land || !this.land.coordinates || this.land.coordinates.length < 3) return;
 
    const points: L.LatLngExpression[] = this.land.coordinates.map((c: any) => [c.latitude, c.longitude] as L.LatLngExpression);
 
    // Crear el mapa centrado en el primer punto
    this.map = L.map('map', {
      center: points[0],
      zoom: 15
    });
 
    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
 
    // Dibujar el polígono
    const polygon = L.polygon(points, {
      color: '#69D291',
      fillColor: '#69D291',
      fillOpacity: 0.3
    }).addTo(this.map);
 
    // Ajustar la vista para que quepa todo el polígono con un poco de margen
    this.map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
  }
}
