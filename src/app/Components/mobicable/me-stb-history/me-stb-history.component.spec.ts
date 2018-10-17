import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeStbHistoryComponent } from './me-stb-history.component';

describe('MeStbHistoryComponent', () => {
  let component: MeStbHistoryComponent;
  let fixture: ComponentFixture<MeStbHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeStbHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeStbHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
