import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  TreeControllerService, 
  LandControllerService, 
  TreeTypeControllerService,
  TreeResponseDto,
  LandResponseDto,
  TreeTypeResponseDto,
  LandTreeSummaryResponseDto
} from '../api';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  constructor(
    private treeApi: TreeControllerService,
    private landApi: LandControllerService,
    private treeTypeApi: TreeTypeControllerService
  ) { }

  getMyTrees(): Observable<LandTreeSummaryResponseDto[]> {
    return this.treeApi.getTreesByOwner();
  }

  getLands(): Observable<LandResponseDto[]> {
    return this.landApi.getAllLands();
  }

  getLand(id: number): Observable<LandResponseDto> {
    return this.landApi.getLandById(id);
  }

  getTreeSpecies(): Observable<TreeTypeResponseDto[]> {
    return this.treeTypeApi.getAllTreeTypes();
  }

  getTreeSpeciesById(id: number): Observable<TreeTypeResponseDto> {
    return this.treeTypeApi.getTreeTypeById(id);
  }
}
