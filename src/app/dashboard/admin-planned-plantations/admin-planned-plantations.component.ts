import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-planned-plantations',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent, ConfirmModalComponent, TranslateModule],
  templateUrl: './admin-planned-plantations.component.html',
  styleUrl: './admin-planned-plantations.component.css'
})
export class AdminPlannedPlantationsComponent implements OnInit, OnDestroy {
  plantations: any[] = [];
  lands: any[] = [];
  treeTypes: any[] = [];
  loading = true;
  private _editingPlantation: any = null;
  private _originalPlantation: any = null;
  isNew = false;

  get editingPlantation() { return this._editingPlantation; }
  set editingPlantation(val: any) {
    this._editingPlantation = val;
    if (val) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
  }

  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  confirmModal = {
    visible: false,
    message: '',
    plantationId: null as number | null
  };

  constructor(
    private adminService: AdminService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  loadData() {
    this.loading = true;
    this.adminService.getLands().subscribe({
      next: (lands) => {
        this.lands = lands;
        this.adminService.getTreeSpecies().subscribe({
          next: (types) => {
            this.treeTypes = types;
            this.loadPlantations();
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadPlantations() {
    this.adminService.getPlannedPlantations().subscribe({
      next: (data) => {
        this.plantations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openNew() {
    this.isNew = true;
    this._originalPlantation = null;
    this.editingPlantation = {
      landId: null,
      treeTypeId: null,
      plannedDate: new Date().toISOString().split('T')[0],
      effectiveDate: null,
      minTrees: 0,
      optimalTrees: 0,
      maxTrees: 0,
      isActive: true
    };
  }

  editPlantation(plantation: any) {
    this.isNew = false;
    const formObj = {
      ...plantation,
      landId: plantation.landId || plantation.land?.id,
      treeTypeId: plantation.treeTypeId || plantation.treeType?.id
    };
    this._originalPlantation = { ...formObj };
    this.editingPlantation = { ...formObj };
  }

  isModified(): boolean {
    if (this.isNew) return true;
    if (!this._originalPlantation || !this.editingPlantation) return false;
    return JSON.stringify(this.editingPlantation) !== JSON.stringify(this._originalPlantation);
  }

  cancelEdit() {
    this.editingPlantation = null;
  }

  savePlantation() {
    const action = this.isNew 
      ? this.adminService.createPlannedPlantation(this.editingPlantation)
      : this.adminService.updatePlannedPlantation(this.editingPlantation.id, this.editingPlantation);
    
    action.subscribe({
      next: () => {
        this.loadPlantations();
        this.editingPlantation = null;
        this.showStatus('success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant('PLANNED_PLANTATION.SUCCESS_' + (this.isNew ? 'CREATE' : 'EDIT')));
      },
      error: (err) => {
        this.showStatus('error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant('PLANNED_PLANTATION.ERROR'));
        console.error(err);
      }
    });
  }

  showStatus(type: 'success' | 'error', title: string, message: string) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus() {
    this.statusModal.visible = false;
  }

  deletePlantation(id: number) {
    this.confirmModal = {
      visible: true,
      message: this.translate.instant('COMMON.CONFIRM_DELETE'),
      plantationId: id
    };
  }

  confirmDelete() {
    const id = this.confirmModal.plantationId;
    if (id) {
      this.confirmModal.visible = false;
      this.adminService.deletePlannedPlantation(id).subscribe({
        next: () => {
          this.loadPlantations();
          this.showStatus('success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant('PLANNED_PLANTATION.SUCCESS_DELETE'));
        },
        error: (err) => {
          this.showStatus('error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant('COMMON.ERROR_DELETE'));
          console.error(err);
        }
      });
    }
  }

  cancelDelete() {
    this.confirmModal.visible = false;
  }
}
