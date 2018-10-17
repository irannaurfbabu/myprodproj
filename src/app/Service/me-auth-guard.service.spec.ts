import { TestBed, inject } from '@angular/core/testing';

import { MeAuthGuardService } from './me-auth-guard.service';

describe('MeAuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeAuthGuardService]
    });
  });

  it('should be created', inject([MeAuthGuardService], (service: MeAuthGuardService) => {
    expect(service).toBeTruthy();
  }));
});
