import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MePreloaderCircularComponent } from './me-preloader-circular.component';

describe('MePreloaderCircularComponent', () => {
  let component: MePreloaderCircularComponent;
  let fixture: ComponentFixture<MePreloaderCircularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MePreloaderCircularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MePreloaderCircularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
