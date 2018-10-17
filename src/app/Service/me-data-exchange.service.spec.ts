import { TestBed, inject } from '@angular/core/testing';

import { MeDataExchangeService } from './me-data-exchange.service';

describe('MeDataExchangeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeDataExchangeService]
    });
  });

  it('should be created', inject([MeDataExchangeService], (service: MeDataExchangeService) => {
    expect(service).toBeTruthy();
  }));
});
