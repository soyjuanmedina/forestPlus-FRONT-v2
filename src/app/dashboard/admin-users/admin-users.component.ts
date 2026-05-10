import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component( {
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent, ConfirmModalComponent, TranslateModule, RouterModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
} )
export class AdminUsersComponent implements OnInit, OnDestroy {
  users: any[] = [];
  loading = true;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  
  searchQuery = '';
  private searchSubject = new Subject<string>();
  
  _editingUser: any = null;
  private _originalUser: any = null;
  isNew = false;
  
  companies: any[] = [];
  
  get editingUser() { return this._editingUser; }
  set editingUser(val: any) {
    this._editingUser = val;
    if (val) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
  }

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
    userId: null as number | null
  };

  constructor (
    private adminService: AdminService,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) { 
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadUsers();
    });
  }

  ngOnInit () {
    this.loadUsers();
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => this.companies = data,
      error: (err) => console.error('Error cargando compañías:', err)
    });
  }

  loadUsers () {
    this.loading = true;
    this.adminService.getUsers(this.currentPage, this.pageSize, undefined, undefined, this.searchQuery).subscribe( {
      next: ( data ) => {
        this.users = data.content || [];
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.loading = false;
      },
      error: ( err ) => {
        console.error( err );
        this.loading = false;
      }
    } );
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
      this.loadUsers();
    }
  }

  openNew() {
    this.isNew = true;
    this._originalUser = null;
    
    const currentUserRole = this.authService.getRole();
    const defaultRole = currentUserRole === 'COMPANY_ADMIN' ? 'COMPANY_USER' : 'USER';
    const defaultCompanyId = currentUserRole === 'COMPANY_ADMIN' ? this.authService.getCompanyId() : null;
    
    console.log('Creando nuevo usuario. Rol creador:', currentUserRole, 'Compañía asignada:', defaultCompanyId);
    
    this.editingUser = {
      name: '',
      surname: '',
      secondSurname: '',
      email: '',
      role: defaultRole,
      companyId: defaultCompanyId
    };
  }

  editUser(user: any) {
    this.isNew = false;
    this._originalUser = { ...user };
    this.editingUser = { ...user };
  }

  isModified(): boolean {
    if (this.isNew) return true;
    if (!this._originalUser || !this.editingUser) return false;
    
    // Comparación simple de estado profundo para detectar cambios
    return JSON.stringify(this.editingUser) !== JSON.stringify(this._originalUser);
  }

  cancelEdit () {
    this.editingUser = null;
  }

  saveUser () {
    if ( this.editingUser ) {
      // Limpiar companyId si el rol no lo requiere
      if (!this.shouldShowCompanySelector()) {
        const currentUserRole = this.authService.getRole();
        if (currentUserRole === 'COMPANY_ADMIN') {
          this.editingUser.companyId = this.authService.getCompanyId();
        } else {
          this.editingUser.companyId = null;
        }
      }

      // Validación de seguridad final
      if (this.shouldShowCompanySelector() && !this.editingUser.companyId) {
        this.showStatus('error', 'Error', 'Debes seleccionar una compañía para este tipo de usuario');
        return;
      }
      
      if ((this.editingUser.role === 'COMPANY_ADMIN' || this.editingUser.role === 'COMPANY_USER') && !this.editingUser.companyId) {
        this.showStatus('error', 'Error', 'No se ha podido determinar tu compañía. Por favor, cierra sesión y vuelve a entrar.');
        return;
      }

      if ( this.editingUser.picture ) {
        this.editingUser.picture = this.ensureBase64Prefix( this.editingUser.picture );
      }
      const action = this.isNew
        ? this.adminService.createUser( this.editingUser )
        : this.adminService.updateUser( this.editingUser.id, this.editingUser );

      action.subscribe( {
        next: () => {
          this.loadUsers();
          this.editingUser = null;
          this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'USER.SUCCESS_MSG' ) );
        },
        error: ( err ) => {
          this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
          console.error( err );
        }
      } );
    }
  }

  showStatus ( type: 'success' | 'error', title: string, message: string ) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus () {
    this.statusModal.visible = false;
  }

  deleteUser ( id: number ) {
    this.confirmModal = {
      visible: true,
      message: this.translate.instant( 'COMMON.CONFIRM_DELETE' ),
      userId: id
    };
  }

  confirmDeleteUser () {
    const id = this.confirmModal.userId;
    if ( id ) {
      this.confirmModal.visible = false;
      this.adminService.deleteUser( id ).subscribe( {
        next: () => {
          this.loadUsers();
          this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'COMMON.SUCCESS_DELETE' ) );
        },
        error: ( err ) => {
          this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant( 'COMMON.ERROR_DELETE' ) );
          console.error( err );
        }
      } );
    }
  }

  cancelDelete () {
    this.confirmModal.visible = false;
  }

  ngOnDestroy () {
    document.body.classList.remove('modal-open');
    this.searchSubject.complete();
  }

  onAvatarError ( user: any ) {
    if ( user ) {
      user.picture = '';
    }
  }

  onFileSelected ( event: any ) {
    const file = event.target.files[0];
    if ( file ) {
      if ( file.size > 1 * 1024 * 1024 ) {
        this.showStatus( 'error', 'Error', 'El archivo es demasiado grande (máx 1MB)' );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if ( this.editingUser ) {
          this.editingUser.picture = reader.result as string;
        }
      };
      reader.readAsDataURL( file );
    }
  }

  private ensureBase64Prefix ( picture: string ): string {
    if ( !picture || picture.startsWith( 'http' ) || picture.startsWith( 'data:' ) ) {
      return picture;
    }
    if ( !picture.includes( ' ' ) && picture.length > 30 ) {
      return `data:image/png;base64,${picture}`;
    }
    return picture;
  }

  shouldShowCompanySelector(): boolean {
    if (!this.editingUser) return false;
    
    const currentUserRole = this.authService.getRole();
    // Solo el ADMIN global puede elegir compañía. 
    // Un COMPANY_ADMIN no debería poder cambiarla, ya que está prefijada a la suya.
    if (currentUserRole !== 'ADMIN') return false;

    const role = this.editingUser.role;
    return role === 'COMPANY_ADMIN' || role === 'COMPANY_USER';
  }

  getAvailableRoles(): string[] {
    const currentUserRole = this.authService.getRole();
    if (currentUserRole === 'ADMIN') {
      return ['USER', 'ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER'];
    } else if (currentUserRole === 'COMPANY_ADMIN') {
      return ['COMPANY_ADMIN', 'COMPANY_USER'];
    }
    return ['USER']; // Fallback por seguridad
  }
}
