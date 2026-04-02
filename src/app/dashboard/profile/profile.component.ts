import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
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
    receiveEmails: false
  };

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
  }

  toggleEdit () {
    this.editing = !this.editing;
    if ( !this.editing && this.user ) {
      this.editForm = {
        name: this.user.name || '',
        surname: this.user.surname || '',
        secondSurname: this.user.secondSurname || '',
        role: this.user.role || 'USER',
        receiveEmails: this.user.receiveEmails || false
      };
    }
  }

  saveProfile () {
    const payload = {
      name: this.editForm.name,
      surname: this.editForm.surname,
      secondSurname: this.editForm.secondSurname,
      role: this.editForm.role as any,
      receiveEmails: this.editForm.receiveEmails,
      picture: this.user?.picture
    };

    if ( this.isAdminEditing && this.user?.id ) {
      this.adminService.updateUser( this.user.id, payload as any ).subscribe( {
        next: () => {
          this.editing = false;
          this.showStatus( 'success', 'Success', this.translate.instant( 'PROFILE.SUCCESS_UPDATE' ) );
          this.router.navigate( ['/admin/users'] );
        },
        error: ( err ) => {
          this.showStatus( 'error', 'Error', err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
        }
      } );
      return;
    }

    this.userService.updateProfile( payload as any ).subscribe( {
      next: () => {
        this.editing = false;
        this.showStatus( 'success', 'Success', this.translate.instant( 'PROFILE.SUCCESS_UPDATE' ) );
      },
      error: ( err ) => {
        this.showStatus( 'error', 'Error', err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
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
          this.showStatus( 'success', 'Success', this.translate.instant( 'PROFILE.SUCCESS_DELETE_USER' ) );
          this.router.navigate( ['/admin/users'] );
        } else {
          this.showStatus( 'success', 'Success', this.translate.instant( 'PROFILE.SUCCESS_DELETE_SELF' ) );
          this.authService.logout();
          this.router.navigate( ['/'] );
        }
      },
      error: ( err ) => {
        this.confirmingDelete = false;
        this.showStatus( 'error', 'Error', err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
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
          this.showStatus( 'success', 'Success', this.translate.instant( 'PROFILE.SUCCESS_PICTURE' ) );
        },
        error: ( err ) => {
          let msg = err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' );
          if ( err.error?.error === 'FILE_TOO_LARGE' ) {
            msg = this.translate.instant( 'PROFILE.FILE_TOO_LARGE' );
          }
          this.showStatus( 'error', 'Error', msg );
        }
      } );
    }
  }

  private loadAdminUser ( id: number ) {
    this.adminService.getUserById( id ).subscribe( {
      next: ( user ) => {
        this.populateForm( user );
      },
      error: ( err ) => {
        console.error( 'Error cargando usuario para edición:', err );
        this.showStatus( 'error', 'Error', this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
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
        receiveEmails: user.receiveEmails || false
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
        this.showStatus( 'success', 'Success', this.translate.instant( 'PROFILE.SUCCESS_PASSWORD' ) );
      },
      error: ( err ) => {
        this.showStatus( 'error', 'Error', err.error?.message || this.translate.instant( 'COMMON.ERROR_PROCESSING' ) );
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
        this.showStatus('success', 'Success', this.translate.instant('ASSIGN_TREES.SUCCESS'));
        if (this.editingUserId) {
          this.loadAdminUser(this.editingUserId);
        }
      },
      error: (err) => {
        this.showStatus('error', 'Error', err.error?.message || this.translate.instant('COMMON.ERROR_PROCESSING'));
      }
    });
  }
}
