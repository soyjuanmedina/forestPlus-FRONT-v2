import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { 
  CompanyControllerService, 
  CompanyResponseDto, 
  CompanyRequestDto, 
  CompanyUpdateRequestDto 
} from '../api';

@Injectable( { providedIn: 'root' } )
export class CompanyService {
  private companySubject = new BehaviorSubject<CompanyResponseDto | null>( null );

  constructor ( private companyApi: CompanyControllerService ) {
    const saved = localStorage.getItem( 'forestPlus_company' );
    if ( saved ) this.companySubject.next( JSON.parse( saved ) );
  }

  getCompany$ (): Observable<CompanyResponseDto | null> {
    return this.companySubject.asObservable();
  }

  getCurrentCompany (): CompanyResponseDto | null {
    return this.companySubject.value;
  }

  private persist ( company: CompanyResponseDto | null ) {
    this.companySubject.next( company );
    if ( company ) localStorage.setItem( 'forestPlus_company', JSON.stringify( company ) );
    else localStorage.removeItem( 'forestPlus_company' );
  }

  getAllCompanies (): Observable<CompanyResponseDto[]> {
    return this.companyApi.getAllCompanies();
  }

  getCompanyById ( id: number ): Observable<CompanyResponseDto> {
    return this.companyApi.getCompanyById( id ).pipe(
      tap( company => this.persist( company ) )
    );
  }

  createCompany ( payload: CompanyRequestDto ): Observable<CompanyResponseDto> {
    return this.companyApi.createCompany( payload ).pipe(
      tap( c => this.persist( c ) )
    );
  }

  updateCompany ( id: number, payload: CompanyUpdateRequestDto ): Observable<CompanyResponseDto> {
    return this.companyApi.updateCompany( id, payload ).pipe(
      tap( c => {
        if ( this.getCurrentCompany()?.id === c.id ) this.persist( c );
      } )
    );
  }

  deleteCompany ( id: number ): Observable<any> {
    return this.companyApi.deleteCompany( id ).pipe(
      tap( () => {
        if ( this.getCurrentCompany()?.id === id ) this.persist( null );
      } )
    );
  }
}
