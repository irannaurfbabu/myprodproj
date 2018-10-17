import { TestBed, inject } from '@angular/core/testing';

import { MeGzipService } from './me-gzip.service';

describe('MeGzipService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeGzipService]
    });
  });

  it('should be created', inject([MeGzipService], (service: MeGzipService) => {
    expect(service).toBeTruthy();
  }));
});
