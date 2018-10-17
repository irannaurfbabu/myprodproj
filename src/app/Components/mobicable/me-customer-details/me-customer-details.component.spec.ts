import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCustomerDetailsComponent } from './me-customer-details.component';

describe('MeCustomerDetailsComponent', () => {
  let component: MeCustomerDetailsComponent;
  let fixture: ComponentFixture<MeCustomerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCustomerDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCustomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
