import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { AssignTreesModalComponent } from '../../modals/assign-trees-modal/assign-trees-modal.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TreeService } from '../../services/tree.service';

@Component( {
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusModalComponent, AssignTreesModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
} )
export class ProfileComponent implements OnInit {
  user: any;
  currentUser: any;
  editing = false;
  changingPassword = false;
  isAdminEditing = false;
  editingUserId?: number;
  confirmingDelete = false;

  editForm = {
    name: '',
    surname: '',
    secondSurname: '',
    role: 'USER',
    receiveEmails: false,
    companyId: null as number | null
  };

  companies: any[] = [];

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  previewImage: string | null = null;
  selectedFile: File | null = null;
  
  showingAssignModal = false;

  constructor (
    private authService: AuthService,
    private userService: UserService,
    private adminService: AdminService,
    private companyService: CompanyService,
    private treeService: TreeService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit () {
    this.authService.currentUser$.subscribe( user => {
      this.currentUser = user;
      if ( !this.isAdminEditing ) {
        this.populateForm( user );
      }
    } );
    this.route.paramMap.subscribe( paramMap => {
      const idParam = paramMap.get( 'id' );
      if ( idParam ) {
        const id = Number( idParam );
        if ( !isNaN( id ) ) {
          this.isAdminEditing = true;
          this.editingUserId = id;
          this.loadAdminUser( id );
        }
      }
    } );

    this.route.queryParams.subscribe( params => {
      if ( params['mustChange'] === 'true' ) {
        this.openChangePassword();
        this.showStatus( 'error', 'Seguridad', this.translate.instant( 'PROFILE.MUST_CHANGE_NOTICE' ) );
      }
    } );

    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => this.companies = data,
      error: (err) => console.error('Error cargando compañías:', err)
    });
  }

  toggleEdit () {
    this.editing = !this.editing;
    if ( !this.editing && this.user ) {
      this.editForm = {
        name: this.user.name || '',
        surname: this.user.surname || '',
        secondSurname: this.user.secondSurname || '',
        role: this.user.role || 'USER',
        receiveEmails: this.user.receiveEmails || false,
        companyId: this.user.company?.id || null
      };
    }
  }

  saveProfile () {
    if (this.isAdminEditing && !this.shouldShowCompanySelector()) {
      this.editForm.companyId = null;
    }

    const payload = {
      name: this.editForm.name,
      surname: this.editForm.surname,
      secondSurname: this.editForm.secondSurname,
      role: this.editForm.role as any,
      receiveEmails: this.editForm.receiveEmails,
      companyId: this.editForm.companyId,
      picture: this.user?.picture
    };

    if ( this.isAdminEditing && this.user?.id ) {
      this.adminService.updateUser( this.user.id, payload as any ).subscribe( {
        next: () => {
          this.editing = false;
          this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'PROFILE.SUCCESS_UPDATE' ) );
          this.router.navigate( ['/admin/users'] );
        },
        error: ( err ) => {
          this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
        }
      } );
      return;
    }

    this.userService.updateProfile( payload as any ).subscribe( {
      next: () => {
        this.editing = false;
        this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'PROFILE.SUCCESS_UPDATE' ) );
      },
      error: ( err ) => {
        this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
      }
    } );
  }

  deleteUser () {
    this.confirmingDelete = true;
  }

  cancelDelete () {
    this.confirmingDelete = false;
  }

  confirmDelete () {
    if ( !this.user?.id ) {
      return;
    }

    this.adminService.deleteUser( this.user.id ).subscribe( {
      next: () => {
        this.confirmingDelete = false;
        if ( this.isAdminEditing ) {
          this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'PROFILE.SUCCESS_DELETE_USER' ) );
          this.router.navigate( ['/admin/users'] );
        } else {
          this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'PROFILE.SUCCESS_DELETE_SELF' ) );
          this.authService.logout();
          this.router.navigate( ['/'] );
        }
      },
      error: ( err ) => {
        this.confirmingDelete = false;
        this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
      }
    } );
  }

  onFileSelected ( event: any ) {
    const file = event.target.files[0];
    if ( file ) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL( file );
    }
  }

  uploadPicture () {
    if ( this.previewImage && this.user ) {
      this.userService.updatePicture( this.user.id, this.previewImage ).subscribe( {
        next: ( res ) => {
          this.previewImage = null;
          this.selectedFile = null;
          // El servicio ya actualiza el authService vía tap()
          this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'PROFILE.SUCCESS_PICTURE' ) );
        },
        error: ( err ) => {
          let msg = err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' );
          if ( err.error?.error === 'FILE_TOO_LARGE' ) {
            msg = this.translate.instant( 'PROFILE.FILE_TOO_LARGE' );
          }
          this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), msg );
        }
      } );
    }
  }

  shouldShowCompanySelector(): boolean {
    const role = this.editForm.role;
    return role === 'COMPANY_ADMIN' || role === 'COMPANY_USER';
  }

  private loadAdminUser ( id: number ) {
    this.adminService.getUserById( id ).subscribe( {
      next: ( user ) => {
        this.populateForm( user );
      },
      error: ( err ) => {
        console.error( 'Error cargando usuario para edición:', err );
        this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
        this.router.navigate( ['/admin/users'] );
      }
    } );
  }

  private populateForm ( user: any ) {
    this.user = user;
    if ( user ) {
      this.editForm = {
        name: user.name || '',
        surname: user.surname || '',
        secondSurname: user.secondSurname || '',
        role: user.role || 'USER',
        receiveEmails: user.receiveEmails || false,
        companyId: user.company?.id || null
      };
    }
  }

  cancelPicture () {
    this.previewImage = null;
    this.selectedFile = null;
  }

  openChangePassword () {
    this.changingPassword = true;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  closeChangePassword () {
    this.changingPassword = false;
  }

  submitPassword () {
    if ( this.passwordForm.newPassword !== this.passwordForm.confirmPassword ) {
      this.showStatus( 'error', 'Error', this.translate.instant( 'PROFILE.PASSWORD_MISMATCH' ) );
      return;
    }

    this.userService.changePassword( {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    } ).subscribe( {
      next: () => {
        this.changingPassword = false;
        // IMPORTANTE: Actualizar el estado de la sesión para quitar el flag de cambio obligatorio
        if (this.currentUser) {
          this.currentUser.forcePasswordChange = false;
          this.authService.updateCurrentUser(this.currentUser);
        }
        this.showStatus( 'success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant( 'PROFILE.SUCCESS_PASSWORD' ) );
      },
      error: ( err ) => {
        this.showStatus( 'error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
      }
    } );
  }

  onProfileAvatarError () {
    this.previewImage = null;
    if ( this.user ) {
      this.user.picture = '';
    }
  }

  showStatus ( type: 'success' | 'error', title: string, message: string ) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus () {
    this.statusModal.visible = false;
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
        this.showStatus('success', this.translate.instant('COMMON.SUCCESS'), this.translate.instant('ASSIGN_TREES.SUCCESS'));
        if (this.editingUserId) {
          this.loadAdminUser(this.editingUserId);
        }
      },
      error: ( err ) => {
        this.showStatus('error', this.translate.instant('COMMON.ERROR'), err.error?.message || this.translate.instant('COMMON.ERROR_PROCESSING'));
      }
    });
  }
}
