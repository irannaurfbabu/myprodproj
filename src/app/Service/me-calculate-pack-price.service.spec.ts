import { TestBed, inject } from '@angular/core/testing';

import { MeCalculatePackPriceService } from './me-calculate-pack-price.service';

describe('MeCalculatePackPriceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeCalculatePackPriceService]
    });
  });

  it('should be created', inject([MeCalculatePackPriceService], (service: MeCalculatePackPriceService) => {
    expect(service).toBeTruthy();
  }));
});
