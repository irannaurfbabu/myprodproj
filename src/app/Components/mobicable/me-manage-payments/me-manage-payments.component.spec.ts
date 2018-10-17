import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeManagePaymentsComponent } from './me-manage-payments.component';

describe('MeManagePaymentsComponent', () => {
  let component: MeManagePaymentsComponent;
  let fixture: ComponentFixture<MeManagePaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeManagePaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeManagePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
