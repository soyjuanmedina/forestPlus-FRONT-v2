import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  PlannedPlantationControllerService, 
  PlannedPlantationResponseDto, 
  PlannedPlantationRequestDto,
  PlannedPlantationUpdateRequestDto
} from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class PlannedPlantationService {

  constructor ( private plannedApi: PlannedPlantationControllerService ) { }

  getAll (): Observable<PlannedPlantationResponseDto[]> {
    return this.plannedApi.getAll();
  }

  getById ( id: number ): Observable<PlannedPlantationResponseDto> {
    return this.plannedApi.getById( id );
  }

  create ( payload: PlannedPlantationRequestDto ): Observable<PlannedPlantationResponseDto> {
    return this.plannedApi.create( payload );
  }

  update ( id: number, payload: PlannedPlantationUpdateRequestDto ): Observable<PlannedPlantationResponseDto> {
    return this.plannedApi.update( id, payload );
  }

  delete ( id: number ): Observable<any> {
    return this.plannedApi._delete( id );
  }
}
