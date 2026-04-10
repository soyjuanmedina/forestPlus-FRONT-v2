import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { StatusModalComponent } from '../../shared/status-modal/status-modal.component';
import { appConfig } from '../../app.config';

describe( 'RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach( async () => {
    const authSpy = jasmine.createSpyObj( 'AuthService', ['register'] );
    const routerSpyObj = jasmine.createSpyObj( 'Router', ['navigateByUrl'] );

    await TestBed.configureTestingModule( {
      imports: [RegisterComponent, HttpClientTestingModule, StatusModalComponent],
      providers: [
        ...appConfig.providers,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ],
    } ).compileComponents();

    fixture = TestBed.createComponent( RegisterComponent );
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject( AuthService ) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject( Router ) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  } );

  it( 'should create', () => {
    expect( component ).toBeTruthy();
  } );

  it( 'should register user and navigate to verify-email', () => {
    authServiceSpy.register.and.returnValue( of( {} ) );

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password123';

    component.onSubmit();

    expect( authServiceSpy.register ).toHaveBeenCalledWith( 'Test User', 'test@example.com', 'password123' );
    expect( routerSpy.navigateByUrl ).toHaveBeenCalledWith( '/verify-email' );
  } );

  it( 'should show error on registration failure', () => {
    authServiceSpy.register.and.returnValue( throwError( () => ( { error: { message: 'Email exists' } } ) ) );

    component.name = 'Test User';
    component.email = 'test@example.com';
    component.password = 'password123';

    component.onSubmit();

    expect( component.statusModal.visible ).toBeTrue();
    expect( component.statusModal.type ).toBe( 'error' );
  } );
} );
