import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeTablePreloaderComponent } from './me-table-preloader.component';

describe('MeTablePreloaderComponent', () => {
  let component: MeTablePreloaderComponent;
  let fixture: ComponentFixture<MeTablePreloaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeTablePreloaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeTablePreloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
