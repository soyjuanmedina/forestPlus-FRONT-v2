import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-lands',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent, ConfirmModalComponent, TranslateModule],
  templateUrl: './admin-lands.component.html',
  styleUrl: './admin-lands.component.css'
})
export class AdminLandsComponent implements OnInit {
  lands: any[] = [];
  loading = true;
  private _editingLand: any = null;
  private _originalLand: any = null;
  isNew = false;

  get editingLand() { return this._editingLand; }
  set editingLand(val: any) {
    this._editingLand = val;
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
    landId: null as number | null
  };

  constructor(
    private adminService: AdminService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadLands();
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  loadLands() {
    this.adminService.getLands().subscribe({
      next: (data) => {
        this.lands = data;
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
    this._originalLand = null;
    this.editingLand = {
      name: '',
      description: '',
      location: '',
      area: 0,
      maxTrees: 1000,
      picture: '',
      coordinates: []
    };
  }

  editLand(land: any) {
    this.isNew = false;
    this._originalLand = { ...land, coordinates: [...(land.coordinates || [])] };
    this.editingLand = { ...land, coordinates: [...(land.coordinates || [])] };
  }

  isModified(): boolean {
    if (this.isNew) return true;
    if (!this._originalLand || !this.editingLand) return false;
    return JSON.stringify(this.editingLand) !== JSON.stringify(this._originalLand);
  }

  cancelEdit() {
    this.editingLand = null;
  }

  saveLand() {
    this.editingLand.picture = this.ensureBase64Prefix(this.editingLand.picture);
    
    const action = this.isNew 
      ? this.adminService.createLand(this.editingLand)
      : this.adminService.updateLand(this.editingLand.id, this.editingLand);
    
    action.subscribe({
      next: () => {
        this.loadLands();
        this.editingLand = null;
        this.showStatus('success', 'Success', this.translate.instant('LAND_MODAL.SUCCESS_' + (this.isNew ? 'CREATE' : 'EDIT')));
      },
      error: (err) => {
        this.showStatus('error', 'Error', err.error?.message || this.translate.instant('LAND_MODAL.ERROR'));
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

  deleteLand(id: number) {
    this.confirmModal = {
      visible: true,
      message: this.translate.instant('COMMON.CONFIRM_DELETE'),
      landId: id
    };
  }

  confirmDeleteLand() {
    const id = this.confirmModal.landId;
    if (id) {
      this.confirmModal.visible = false;
      this.adminService.deleteLand(id).subscribe({
        next: () => {
          this.loadLands();
          this.showStatus('success', 'Success', this.translate.instant('COMMON.SUCCESS_DELETE'));
        },
        error: (err) => {
          this.showStatus('error', 'Error', err.error?.message || this.translate.instant('COMMON.ERROR_DELETE'));
          console.error(err);
        }
      });
    }
  }

  cancelDelete() {
    this.confirmModal.visible = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        this.showStatus('error', 'Error', 'El archivo es demasiado grande (máx 1MB)');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.editingLand.picture = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private ensureBase64Prefix(picture: string): string {
    if (!picture || picture.startsWith('http') || picture.startsWith('data:')) {
      return picture;
    }
    // Si parece base64 (sin espacios y de longitud mínima), añadimos el prefijo PNG por defecto
    if (!picture.includes(' ') && picture.length > 30) {
      return `data:image/png;base64,${picture}`;
    }
    return picture;
  }
 
  addCoordinate() {
    if (!this.editingLand.coordinates) {
      this.editingLand.coordinates = [];
    }
    this.editingLand.coordinates.push({ latitude: 0, longitude: 0 });
  }
 
  removeCoordinate(index: number) {
    this.editingLand.coordinates.splice(index, 1);
  }
}
