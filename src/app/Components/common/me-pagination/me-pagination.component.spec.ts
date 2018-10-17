import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MePaginationComponent } from './me-pagination.component';

describe('MePaginationComponent', () => {
  let component: MePaginationComponent;
  let fixture: ComponentFixture<MePaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MePaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MePaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
