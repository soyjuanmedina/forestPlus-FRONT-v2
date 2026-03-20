import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any;
  editing = false;
  changingPassword = false;
  
  editForm = {
    name: '',
    surname: '',
    secondSurname: '',
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

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.editForm = {
          name: user.name || '',
          surname: user.surname || '',
          secondSurname: user.secondSurname || '',
          receiveEmails: user.receiveEmails || false
        };
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['mustChange'] === 'true') {
        this.openChangePassword();
        this.showStatus('error', 'Seguridad', this.translate.instant('PROFILE.MUST_CHANGE_NOTICE'));
      }
    });
  }

  toggleEdit() {
    this.editing = !this.editing;
    if (!this.editing && this.user) {
      this.editForm = {
        name: this.user.name || '',
        surname: this.user.surname || '',
        secondSurname: this.user.secondSurname || '',
        receiveEmails: this.user.receiveEmails || false
      };
    }
  }

  saveProfile() {
    this.userService.updateProfile(this.editForm).subscribe({
      next: () => {
        this.editing = false;
        this.showStatus('success', 'Success', this.translate.instant('PROFILE.SUCCESS_UPDATE'));
      },
      error: (err) => {
        this.showStatus('error', 'Error', err.error?.message || this.translate.instant('COMMON.ERROR_PROCESSING'));
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPicture() {
    if (this.selectedFile && this.user) {
      this.userService.updatePicture(this.user.id, this.selectedFile).subscribe({
        next: () => {
          this.previewImage = null;
          this.selectedFile = null;
          this.showStatus('success', 'Success', this.translate.instant('PROFILE.SUCCESS_PICTURE'));
        },
        error: (err) => {
          let msg = err.error?.message || this.translate.instant('COMMON.ERROR_PROCESSING');
          if (err.error?.error === 'FILE_TOO_LARGE') {
            msg = this.translate.instant('PROFILE.FILE_TOO_LARGE');
          }
          this.showStatus('error', 'Error', msg);
        }
      });
    }
  }

  cancelPicture() {
    this.previewImage = null;
    this.selectedFile = null;
  }

  openChangePassword() {
    this.changingPassword = true;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  closeChangePassword() {
    this.changingPassword = false;
  }

  submitPassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showStatus('error', 'Error', this.translate.instant('PROFILE.PASSWORD_MISMATCH'));
      return;
    }

    this.userService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.showStatus('success', 'Success', this.translate.instant('PROFILE.SUCCESS_PASSWORD'));
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
}
