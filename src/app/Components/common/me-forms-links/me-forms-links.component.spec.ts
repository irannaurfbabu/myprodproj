import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeFormsLinksComponent } from './me-forms-links.component';

describe('MeFormsLinksComponent', () => {
  let component: MeFormsLinksComponent;
  let fixture: ComponentFixture<MeFormsLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeFormsLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeFormsLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
