import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyResponseDto } from '../../api';

@Component( {
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent, ConfirmModalComponent, TranslateModule, RouterModule],
  templateUrl: './admin-companies.component.html',
  styleUrl: './admin-companies.component.css'
} )
export class AdminCompaniesComponent implements OnInit, OnDestroy {
  private companyService = inject( CompanyService );
  private router = inject( Router );
  private translate = inject( TranslateService );

  companies: CompanyResponseDto[] = [];
  filteredCompanies: CompanyResponseDto[] = [];
  loading = true;
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // Modal de estado
  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  // Modal de confirmación
  confirmModal = {
    visible: false,
    message: '',
    companyId: null as number | null
  };

  constructor () { 
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.applyFilter();
    });
  }

  ngOnInit () {
    this.loadCompanies();
  }

  loadCompanies () {
    this.loading = true;
    this.companyService.getAllCompanies().subscribe( {
      next: ( data ) => {
        this.companies = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: ( err ) => {
        console.error( err );
        this.loading = false;
      }
    } );
  }

  applyFilter() {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredCompanies = this.companies.filter(c => 
      c.name?.toLowerCase().includes(query) || 
      c.address?.toLowerCase().includes(query)
    );
    
    this.totalElements = this.filteredCompanies.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.updatePagedCompanies();
  }

  updatePagedCompanies() {
    // La paginación real se hace en el getter o aquí si quisiéramos una sub-lista
  }

  get pagedCompanies(): CompanyResponseDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredCompanies.slice(start, start + this.pageSize);
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.onSearch();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }

  addCompany() {
    this.router.navigate(['/company/form', 'new']);
  }

  editCompany(company: CompanyResponseDto) {
    this.router.navigate(['/company/form', company.id]);
  }

  viewCompany(company: CompanyResponseDto) {
    this.router.navigate(['/company', company.id]);
  }

  deleteCompany(id: number) {
    this.confirmModal = {
      visible: true,
      message: this.translate.instant('COMMON.CONFIRM_DELETE'),
      companyId: id
    };
  }

  confirmDeleteCompany() {
    const id = this.confirmModal.companyId;
    if (id) {
      this.confirmModal.visible = false;
      this.companyService.deleteCompany(id).subscribe({
        next: () => {
          this.loadCompanies();
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

  showStatus(type: 'success' | 'error', title: string, message: string) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus() {
    this.statusModal.visible = false;
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
