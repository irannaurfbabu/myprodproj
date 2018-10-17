import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeStbDetailsComponent } from './me-stb-details.component';

describe('MeStbDetailsComponent', () => {
  let component: MeStbDetailsComponent;
  let fixture: ComponentFixture<MeStbDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeStbDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeStbDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
