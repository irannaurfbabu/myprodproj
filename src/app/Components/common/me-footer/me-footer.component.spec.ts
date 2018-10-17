import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeFooterComponent } from './me-footer.component';

describe('MeFooterComponent', () => {
  let component: MeFooterComponent;
  let fixture: ComponentFixture<MeFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
