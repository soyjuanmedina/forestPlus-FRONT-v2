import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  TreeControllerService, 
  LandControllerService, 
  TreeTypeControllerService,
  TreeResponseDto,
  LandResponseDto,
  TreeTypeResponseDto,
  LandTreeSummaryResponseDto,
  TreeBatchPlantRequestDto
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

  getMyTrees(): Observable<TreeResponseDto[]> {
    return this.treeApi.getAllTreesByOwner();
  }

  getTreeById(id: number): Observable<TreeResponseDto> {
    return this.treeApi.getTreeById(id);
  }

  updateTree(id: number, dto: any): Observable<TreeResponseDto> {
    return this.treeApi.updateTree(id, dto);
  }

  plantTreeBatch(request: TreeBatchPlantRequestDto): Observable<any> {
    return this.treeApi.plantTreeBatch(request);
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
