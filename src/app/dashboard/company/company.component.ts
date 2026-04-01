import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AssignTreesModalComponent } from '../../modals/assign-trees-modal/assign-trees-modal.component';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { TreeService } from '../../services/tree.service';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, TranslateModule, AssignTreesModalComponent, StatusModalComponent],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-4">Company View</h1>
      <p class="mb-8 text-gray-600">Próximamente: información de compañía y estadísticas de CO2.</p>

      <button *ngIf="companyId" (click)="openAssignModal()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-medium shadow-md hover:shadow-lg transition-all">
        <i class="fa-solid fa-tree mr-2"></i> {{ 'ASSIGN_TREES.ASSIGN' | translate }}
      </button>
    </div>

    <!-- Modal Asignar Árboles -->
    <app-assign-trees-modal 
      *ngIf="showingAssignModal"
      [companyId]="companyId"
      (close)="closeAssignModal()"
      (assigned)="onTreesAssigned($event)">
    </app-assign-trees-modal>

    <!-- Modal Estado -->
    <app-status-modal [visible]="statusModal.visible" [type]="statusModal.type"
      [title]="statusModal.title" [message]="statusModal.message" (close)="closeStatus()">
    </app-status-modal>
  `
})
export class CompanyComponent implements OnInit {
  companyId?: number;
  showingAssignModal = false;

  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  constructor(
    private route: ActivatedRoute,
    private treeService: TreeService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.companyId = Number(idParam);
      }
    });
  }

  openAssignModal() {
    this.showingAssignModal = true;
  }

  closeAssignModal() {
    this.showingAssignModal = false;
  }

  onTreesAssigned(payload: any) {
    this.treeService.plantTreeBatch(payload).subscribe({
      next: () => {
        this.showingAssignModal = false;
        this.showStatus('success', 'Success', this.translate.instant('ASSIGN_TREES.SUCCESS'));
      },
      error: (err) => {
        this.showStatus('error', 'Error', err.error?.message || this.translate.instant('COMMON.ERROR_PROCESSING'));
      }
    });
  }

  showStatus ( type: 'success' | 'error', title: string, message: string ) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus () {
    this.statusModal.visible = false;
  }
}
