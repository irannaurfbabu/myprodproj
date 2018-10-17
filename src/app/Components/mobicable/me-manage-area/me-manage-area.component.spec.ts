import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeManageAreaComponent } from './me-manage-area.component';

describe('MeManageAreaComponent', () => {
  let component: MeManageAreaComponent;
  let fixture: ComponentFixture<MeManageAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeManageAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeManageAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
