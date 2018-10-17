import { TestBed, inject } from '@angular/core/testing';

import { MeCalculateDateService } from './me-calculate-date.service';

describe('MeCalculateDateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeCalculateDateService]
    });
  });

  it('should be created', inject([MeCalculateDateService], (service: MeCalculateDateService) => {
    expect(service).toBeTruthy();
  }));
});
