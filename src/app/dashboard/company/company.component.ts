import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../services/company.service';
import { CompanyCo2Service } from '../../services/company-co2.service';
import { CompanyResponseDto, CompanyCO2YearlyResponseDto, TreeControllerService, TreeResponseDto } from '../../api';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { AssignTreesModalComponent } from '../../modals/assign-trees-modal/assign-trees-modal.component';
import { TreeService } from '../../services/tree.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, StatusModalComponent, AssignTreesModalComponent],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css'
})
export class CompanyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private companyCo2Service = inject(CompanyCo2Service);
  private treeApi = inject(TreeControllerService);
  private treeService = inject(TreeService);
  private translate = inject(TranslateService);

  companyId?: number;
  company?: CompanyResponseDto;
  trees: TreeResponseDto[] = [];
  co2Records: CompanyCO2YearlyResponseDto[] = [];
  loading = true;

  // KPIs calculados localmente
  stats = {
    totalTrees: 0,
    totalCo2: 0
  };

  showingAssignModal = false;
  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.companyId = Number(idParam);
        this.loadAllData(this.companyId);
      } else {
        this.loading = false;
      }
    });
  }

  loadAllData(id: number) {
    this.loading = true;
    
    forkJoin({
      company: this.companyService.getCompanyById(id).pipe(catchError(err => {
        console.error('Error info empresa:', err);
        return of(null);
      })),
      trees: this.treeApi.getAllTreesByOwner(undefined, id).pipe(catchError(err => {
        console.error('Error árboles empresa:', err);
        return of([]);
      }))
    }).subscribe({
      next: (res) => {
        this.company = res.company || undefined;
        this.trees = res.trees || [];
        this.co2Records = (this.company?.co2 || []).sort((a,b) => (b.year || 0) - (a.year || 0));
        
        // Calcular estadísticas
        this.stats.totalTrees = this.trees.length;
        this.stats.totalCo2 = this.co2Records.reduce((acc, curr) => acc + (curr.totalCompensations || 0), 0);
        
        this.loading = false;

        if (!this.company) {
          this.showStatus('error', 'No encontrado', 'No se ha podido cargar la información de esta compañía.');
        }
      },
      error: (err) => {
        console.error('Error crítico en forkJoin:', err);
        this.loading = false;
        this.showStatus('error', 'Error', 'Error al sincronizar los datos de la compañía.');
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
        this.showStatus('success', 'Éxito', this.translate.instant('ASSIGN_TREES.SUCCESS'));
        if (this.companyId) this.loadAllData(this.companyId);
      },
      error: (err) => {
        this.showStatus('error', 'Error', err.error?.message || this.translate.instant('COMMON.ERROR_PROCESSING'));
      }
    });
  }

  showStatus(type: 'success' | 'error', title: string, message: string) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus() {
    this.statusModal.visible = false;
  }

  get netCo2Records() {
    return this.co2Records.map(r => ({
      ...r,
      net: (r.totalEmissions || 0) - (r.totalCompensations || 0)
    }));
  }
}
