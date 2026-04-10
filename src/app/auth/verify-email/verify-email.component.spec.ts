import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { VerifyEmailComponent } from './verify-email.component';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { appConfig } from '../../app.config';

describe( 'VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;

  beforeEach( async () => {
    const activatedRouteMock = {
      queryParamMap: of( convertToParamMap( {} ) )
    };

    await TestBed.configureTestingModule( {
      imports: [VerifyEmailComponent, HttpClientTestingModule, StatusModalComponent],
      providers: [
        ...appConfig.providers,
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
    } ).compileComponents();

    fixture = TestBed.createComponent( VerifyEmailComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  } );

  it( 'should create', () => {
    expect( component ).toBeTruthy();
  } );

  it( 'should show idle state when no uuid', () => {
    expect( component.verificationState ).toBe( 'idle' );
    expect( component.isLoading ).toBeFalse();
  } );
} );
