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
  editingLand: any = null;
  isNew = false;

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
    this.editingLand = {
      name: '',
      description: '',
      location: '',
      area: 0,
      maxTrees: 1000,
      picture: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'
    };
  }

  editLand(land: any) {
    this.isNew = false;
    this.editingLand = { ...land };
  }

  cancelEdit() {
    this.editingLand = null;
  }

  saveLand() {
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
}
