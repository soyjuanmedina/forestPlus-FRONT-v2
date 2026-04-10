import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDetailComponent } from './tree-detail.component';

describe('TreeDetailComponent', () => {
  let component: TreeDetailComponent;
  let fixture: ComponentFixture<TreeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TreeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
