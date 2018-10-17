import { TestBed, inject } from '@angular/core/testing';

import { MeUserProfileService } from './me-user-profile.service';

describe('MeUserProfileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeUserProfileService]
    });
  });

  it('should be created', inject([MeUserProfileService], (service: MeUserProfileService) => {
    expect(service).toBeTruthy();
  }));
});
