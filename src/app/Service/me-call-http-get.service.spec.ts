import { TestBed, inject } from '@angular/core/testing';

import { MeCallHttpGetService } from './me-call-http-get.service';

describe('MeCallHttpGetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeCallHttpGetService]
    });
  });

  it('should be created', inject([MeCallHttpGetService], (service: MeCallHttpGetService) => {
    expect(service).toBeTruthy();
  }));
});
