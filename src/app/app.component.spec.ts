import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';
import { AuthService } from './services/auth.service';
import { of } from 'rxjs';

describe( 'AppComponent', () => {
  let authServiceMock: any;

  beforeEach( async () => {
    authServiceMock = {
      currentUser$: of( null ),
      isLoggedIn: () => false,
      logout: () => { },
      getCurrentUser: () => null
    };

    await TestBed.configureTestingModule( {
      imports: [AppComponent, HttpClientTestingModule],
      providers: [
        ...appConfig.providers,
        { provide: AuthService, useValue: authServiceMock }
      ],
    } ).compileComponents();
  } );

  it( 'should create the app', () => {
    const fixture = TestBed.createComponent( AppComponent );
    const app = fixture.componentInstance;
    expect( app ).toBeTruthy();
  } );

  it( `should have the 'forest+' title`, () => {
    const fixture = TestBed.createComponent( AppComponent );
    const app = fixture.componentInstance;
    expect( app.title ).toEqual( 'forest+' );
  } );

  it( 'should render title', () => {
    const fixture = TestBed.createComponent( AppComponent );
    fixture.detectChanges();
    const app = fixture.componentInstance;
    expect( app.title ).toBeDefined();
  } );
} );
