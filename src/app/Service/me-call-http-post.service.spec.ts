import { TestBed, inject } from '@angular/core/testing';

import { MeCallHttpPostService } from './me-call-http-post.service';

describe('MeCallHttpPostService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeCallHttpPostService]
    });
  });

  it('should be created', inject([MeCallHttpPostService], (service: MeCallHttpPostService) => {
    expect(service).toBeTruthy();
  }));
});
