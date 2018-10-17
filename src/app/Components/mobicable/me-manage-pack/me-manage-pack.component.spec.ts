import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeManagePackComponent } from './me-manage-pack.component';

describe('MeManagePackComponent', () => {
  let component: MeManagePackComponent;
  let fixture: ComponentFixture<MeManagePackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeManagePackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeManagePackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
