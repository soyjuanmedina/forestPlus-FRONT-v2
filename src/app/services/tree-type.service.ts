import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  TreeTypeControllerService, 
  TreeTypeResponseDto, 
  TreeTypeRequestDto, 
  TreeTypeUpdateRequestDto 
} from '../api';

@Injectable( {
  providedIn: 'root'
} )
export class TreeTypeService {

  constructor ( private treeTypeApi: TreeTypeControllerService ) { }

  getTreeTypes (): Observable<TreeTypeResponseDto[]> {
    return this.treeTypeApi.getAllTreeTypes();
  }

  getTreeTypeById ( id: number ): Observable<TreeTypeResponseDto> {
    return this.treeTypeApi.getTreeTypeById( id );
  }

  createTreeType ( data: TreeTypeRequestDto ): Observable<TreeTypeResponseDto> {
    return this.treeTypeApi.createTreeType( data );
  }

  updateTreeType ( id: number, data: TreeTypeUpdateRequestDto ): Observable<TreeTypeResponseDto> {
    return this.treeTypeApi.updateTreeType( id, data );
  }

  deleteTreeType ( id: number ): Observable<any> {
    return this.treeTypeApi.deleteTreeType( id );
  }
}
