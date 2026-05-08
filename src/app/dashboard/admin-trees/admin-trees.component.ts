import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeResponseDto } from '../../api';

@Component({
  selector: 'app-admin-trees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusModalComponent, ConfirmModalComponent, TranslateModule],
  templateUrl: './admin-trees.component.html',
  styleUrl: './admin-trees.component.css'
})
export class AdminTreesComponent implements OnInit {
  trees: TreeResponseDto[] = [];
  filteredTrees: TreeResponseDto[] = [];
  loading = true;
  searchQuery = '';

  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  confirmModal = {
    visible: false,
    message: '',
    treeId: null as number | null
  };

  constructor(
    private adminService: AdminService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadTrees();
  }

  loadTrees() {
    this.loading = true;
    this.adminService.getTrees().subscribe({
      next: (data) => {
        this.trees = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.applyFilter();
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredTrees = [...this.trees];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredTrees = this.trees.filter(t => 
      t.id?.toString().includes(query) ||
      t.customName?.toLowerCase().includes(query) ||
      t.treeType?.name?.toLowerCase().includes(query) ||
      t.ownerUserName?.toLowerCase().includes(query) ||
      t.ownerCompanyName?.toLowerCase().includes(query) ||
      t.land?.name?.toLowerCase().includes(query)
    );
  }

  deleteTree(id: number) {
    this.confirmModal = {
      visible: true,
      message: this.translate.instant('COMMON.CONFIRM_DELETE'),
      treeId: id
    };
  }

  confirmDeleteTree() {
    const id = this.confirmModal.treeId;
    if (id) {
      this.confirmModal.visible = false;
      this.adminService.deleteTree(id).subscribe({
        next: () => {
          this.loadTrees();
          this.showStatus('success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant('COMMON.SUCCESS_DELETE'));
        },
        error: (err) => {
          const errorMessage = err.error?.message ? this.translate.instant(err.error.message) : this.translate.instant('COMMON.ERROR_DELETE');
          this.showStatus('error', this.translate.instant('COMMON.ERROR'), errorMessage);
          console.error(err);
        }
      });
    }
  }

  cancelDelete() {
    this.confirmModal.visible = false;
  }

  showStatus(type: 'success' | 'error', title: string, message: string) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus() {
    this.statusModal.visible = false;
  }
}
