import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { Router } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component( {
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent, ConfirmModalComponent, TranslateModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
} )
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  private _editingUser: any = null;
  private _originalUser: any = null;
  isNew = false;

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
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit () {
    this.loadUsers();
  }

  loadUsers () {
    this.adminService.getUsers().subscribe( {
      next: ( data ) => {
        // El backend devuelve un Page, los datos están en 'content'
        this.users = data || [];
        this.loading = false;
      },
      error: ( err ) => console.error( err )
    } );
  }

  openNew() {
    this.isNew = true;
    this._originalUser = null;
    this.editingUser = {
      name: '',
      surname: '',
      secondSurname: '',
      email: '',
      role: 'USER',
      companyId: null
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
          this.showStatus( 'success', 'Success', this.translate.instant( 'USER.SUCCESS_MSG' ) );
        },
        error: ( err ) => {
          this.showStatus( 'error', 'Error', err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
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
          this.showStatus( 'success', 'Success', this.translate.instant( 'COMMON.SUCCESS_DELETE' ) );
        },
        error: ( err ) => {
          this.showStatus( 'error', 'Error', err.error?.message || this.translate.instant( 'COMMON.ERROR_DELETE' ) );
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
}
