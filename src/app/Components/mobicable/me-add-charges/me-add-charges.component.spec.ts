import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeAddChargesComponent } from './me-add-charges.component';

describe('MeAddChargesComponent', () => {
  let component: MeAddChargesComponent;
  let fixture: ComponentFixture<MeAddChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeAddChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeAddChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
