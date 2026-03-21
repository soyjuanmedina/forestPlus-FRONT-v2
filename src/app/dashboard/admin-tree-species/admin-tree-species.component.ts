import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-tree-species',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent, ConfirmModalComponent, TranslateModule],
  templateUrl: './admin-tree-species.component.html',
  styleUrl: './admin-tree-species.component.css'
})
export class AdminTreeSpeciesComponent implements OnInit {
  treeSpecies: any[] = [];
  loading = true;
  private _editingSpecies: any = null;
  private _originalSpecies: any = null;
  isNew = false;

  get editingSpecies() { return this._editingSpecies; }
  set editingSpecies(val: any) {
    this._editingSpecies = val;
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
    speciesId: null as number | null
  };

  constructor(
    private adminService: AdminService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadTreeSpecies();
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  loadTreeSpecies() {
    this.adminService.getTreeSpecies().subscribe({
      next: (data) => {
        this.treeSpecies = data;
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
    this._originalSpecies = null;
    this.editingSpecies = {
      name: '',
      scientificName: '',
      description: '',
      co2AbsorptionAt20: null,
      co2AbsorptionAt25: null,
      co2AbsorptionAt30: null,
      co2AbsorptionAt35: null,
      co2AbsorptionAt40: null,
      typicalHeight: null,
      lifespanYears: null,
      picture: ''
    };
  }

  editSpecies(species: any) {
    this.isNew = false;
    this._originalSpecies = { ...species };
    this.editingSpecies = { ...species };
  }

  isModified(): boolean {
    if (this.isNew) return true;
    if (!this._originalSpecies || !this.editingSpecies) return false;
    return JSON.stringify(this.editingSpecies) !== JSON.stringify(this._originalSpecies);
  }

  cancelEdit() {
    this.editingSpecies = null;
  }

  saveSpecies() {
    if (this.editingSpecies.picture) {
      this.editingSpecies.picture = this.ensureBase64Prefix(this.editingSpecies.picture);
    }
    const action = this.isNew 
      ? this.adminService.createTreeSpecies(this.editingSpecies)
      : this.adminService.updateTreeSpecies(this.editingSpecies.id, this.editingSpecies);
    
    action.subscribe({
      next: () => {
        this.loadTreeSpecies();
        this.editingSpecies = null;
        this.showStatus('success', 'Success', this.isNew ? 'Especie creada' : 'Especie actualizada');
      },
      error: (err) => {
        this.showStatus('error', 'Error', err.error?.message || 'Error guardando especie');
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

  deleteSpecies(id: number) {
    this.confirmModal = {
      visible: true,
      message: this.translate.instant('COMMON.CONFIRM_DELETE'),
      speciesId: id
    };
  }

  confirmDeleteSpecies() {
    const id = this.confirmModal.speciesId;
    if (id) {
      this.confirmModal.visible = false;
      this.adminService.deleteTreeSpecies(id).subscribe({
        next: () => {
          this.loadTreeSpecies();
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
        if (this.editingSpecies) {
          this.editingSpecies.picture = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private ensureBase64Prefix(picture: string): string {
    if (!picture || picture.startsWith('http') || picture.startsWith('data:')) {
      return picture;
    }
    if (!picture.includes(' ') && picture.length > 30) {
      return `data:image/png;base64,${picture}`;
    }
    return picture;
  }
}
