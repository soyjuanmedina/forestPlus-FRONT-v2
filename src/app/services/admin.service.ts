import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  UserControllerService, 
  LandControllerService, 
  TreeTypeControllerService,
  PlannedPlantationControllerService,
  UserResponseDto,
  RegisterUserByAdminRequestDto,
  LandResponseDto,
  LandRequestDto,
  LandUpdateRequestDto,
  TreeTypeResponseDto,
  TreeTypeRequestDto,
  TreeTypeUpdateRequestDto,
  PlannedPlantationResponseDto,
  PlannedPlantationRequestDto,
  PlannedPlantationUpdateRequestDto
} from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class AdminService {

  constructor ( 
    private userApi: UserControllerService,
    private landApi: LandControllerService,
    private treeTypeApi: TreeTypeControllerService,
    private plannedPlantationApi: PlannedPlantationControllerService
  ) { }

  // Usuarios
  getUsers ( page: number = 0, size: number = 10, role: string | undefined = undefined, companyId: number | undefined = undefined, search: string | undefined = undefined, sort: string | undefined = undefined ): Observable<any> {
    return this.userApi.getUsers( role, companyId, search, page, size, sort );
  }

  getUserById ( id: number ): Observable<UserResponseDto> {
    return this.userApi.getUserById( id );
  }

  createUser ( data: RegisterUserByAdminRequestDto ): Observable<UserResponseDto> {
    return this.userApi.registerUserByAdmin( data );
  }

  updateUser ( id: number, data: RegisterUserByAdminRequestDto ): Observable<UserResponseDto> {
    return this.userApi.updateUserByAdmin( id, data );
  }

  deleteUser ( id: number ): Observable<any> {
    return this.userApi.deleteUser( id );
  }

  // Terrenos
  getLands (): Observable<LandResponseDto[]> {
    return this.landApi.getAllLands();
  }

  createLand ( data: LandRequestDto ): Observable<LandResponseDto> {
    return this.landApi.createLand( data );
  }

  updateLand ( id: number, data: LandUpdateRequestDto ): Observable<LandResponseDto> {
    return this.landApi.updateLand( id, data );
  }

  deleteLand ( id: number ): Observable<any> {
    return this.landApi.deleteLand( id );
  }

  // Especies de Árboles
  getTreeSpecies (): Observable<TreeTypeResponseDto[]> {
    return this.treeTypeApi.getAllTreeTypes();
  }

  createTreeSpecies ( data: TreeTypeRequestDto ): Observable<TreeTypeResponseDto> {
    return this.treeTypeApi.createTreeType( data );
  }

  updateTreeSpecies ( id: number, data: TreeTypeUpdateRequestDto ): Observable<TreeTypeResponseDto> {
    return this.treeTypeApi.updateTreeType( id, data );
  }

  deleteTreeSpecies ( id: number ): Observable<any> {
    return this.treeTypeApi.deleteTreeType( id );
  }

  // Plantaciones Previstas
  getPlannedPlantations (): Observable<PlannedPlantationResponseDto[]> {
    return this.plannedPlantationApi.getAll();
  }

  // Método para obtener plantaciones por terreno (accesible por usuarios autenticados)
  getPlannedPlantationsByLand ( landId: number ): Observable<PlannedPlantationResponseDto[]> {
    return this.plannedPlantationApi.getByLand( landId );
  }

  createPlannedPlantation ( data: PlannedPlantationRequestDto ): Observable<PlannedPlantationResponseDto> {
    return this.plannedPlantationApi.create( data );
  }

  updatePlannedPlantation ( id: number, data: PlannedPlantationUpdateRequestDto ): Observable<PlannedPlantationResponseDto> {
    return this.plannedPlantationApi.update( id, data );
  }

  deletePlannedPlantation ( id: number ): Observable<any> {
    return this.plannedPlantationApi._delete( id );
  }
}
