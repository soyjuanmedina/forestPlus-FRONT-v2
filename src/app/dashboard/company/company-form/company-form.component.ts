import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../../services/company.service';
import { CompanyCo2Service } from '../../../services/company-co2.service';
import { StatusModalComponent } from '../../../shared/status-modal/status-modal.component';
import { CompanyResponseDto, CompanyCO2YearlyResponseDto } from '../../../api';

@Component( {
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, StatusModalComponent, RouterModule],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.css'
} )
export class CompanyFormComponent implements OnInit {
  private fb = inject( FormBuilder );
  private companyService = inject( CompanyService );
  private companyCo2Service = inject( CompanyCo2Service );
  private route = inject( ActivatedRoute );
  private router = inject( Router );
  private translate = inject( TranslateService );

  companyForm: FormGroup;
  companyId?: number;
  isNew = true;
  loading = false;

  previewImage: string | null = null;
  selectedFile: File | null = null;

  co2Records: CompanyCO2YearlyResponseDto[] = [];

  statusModal = {
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  };

  constructor () {
    this.companyForm = this.fb.group( {
      name: ['', Validators.required],
      address: [''],
      picture: ['']
    } );
  }

  ngOnInit (): void {
    this.route.paramMap.subscribe( params => {
      const idParam = params.get( 'id' );
      if ( idParam && idParam !== 'new' ) {
        this.isNew = false;
        this.companyId = Number( idParam );
        this.loadCompany( this.companyId );
        this.loadCO2Records( this.companyId );
      }
    } );
  }

  loadCompany ( id: number ) {
    this.loading = true;
    this.companyService.getCompanyById( id ).subscribe( {
      next: ( company: CompanyResponseDto ) => {
        this.companyForm.patchValue( {
          name: company.name,
          address: company.address
        } );
        this.previewImage = company.picture || null;
        this.loading = false;
      },
      error: ( err: any ) => {
        console.error( err );
        this.loading = false;
        this.showStatus( 'error', 'Error', 'No se pudo cargar la información de la empresa' );
      }
    } );
  }

  loadCO2Records ( id: number ) {
    this.companyCo2Service.getAll( id ).subscribe( {
      next: ( records: CompanyCO2YearlyResponseDto[] ) => {
        this.co2Records = records;
      },
      error: ( err: any ) => console.error( 'Error cargando registros CO2:', err )
    } );
  }

  onFileSelected ( event: any ) {
    const file = event.target.files[0];
    if ( file ) {
      if ( file.size > 2 * 1024 * 1024 ) {
        this.showStatus( 'error', 'Error', 'El archivo es demasiado grande (máx 2MB)' );
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL( file );
    }
  }

  saveCompany () {
    if ( this.companyForm.invalid ) return;

    const payload = {
      ...this.companyForm.value,
      picture: this.previewImage
    };

    const action = this.isNew
      ? this.companyService.createCompany( payload )
      : this.companyService.updateCompany( this.companyId!, payload );

    action.subscribe( {
      next: () => {
        this.showStatus( 'success', 'Éxito', this.isNew ? 'Empresa creada correctamente' : 'Empresa actualizada correctamente' );
        setTimeout( () => this.router.navigate( ['/admin/companies'] ), 1500 );
      },
      error: ( err: any ) => {
        this.showStatus( 'error', 'Error', err.error?.message || 'Error al guardar la empresa' );
      }
    } );
  }

  showStatus ( type: 'success' | 'error', title: string, message: string ) {
    this.statusModal = { visible: true, type, title, message };
  }

  closeStatus () {
    this.statusModal.visible = false;
  }
}
