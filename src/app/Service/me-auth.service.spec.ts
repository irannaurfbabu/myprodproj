import { TestBed, inject } from '@angular/core/testing';

import { MeAuthService } from './me-auth.service';

describe('MeAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeAuthService]
    });
  });

  it('should be created', inject([MeAuthService], (service: MeAuthService) => {
    expect(service).toBeTruthy();
  }));
});
