import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeFormPreloaderComponent } from './me-form-preloader.component';

describe('MeFormPreloaderComponent', () => {
  let component: MeFormPreloaderComponent;
  let fixture: ComponentFixture<MeFormPreloaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeFormPreloaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeFormPreloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
