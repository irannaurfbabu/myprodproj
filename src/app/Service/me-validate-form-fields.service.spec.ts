import { TestBed, inject } from '@angular/core/testing';

import { MeValidateFormFieldsService } from './me-validate-form-fields.service';

describe('MeValidateFormFieldsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeValidateFormFieldsService]
    });
  });

  it('should be created', inject([MeValidateFormFieldsService], (service: MeValidateFormFieldsService) => {
    expect(service).toBeTruthy();
  }));
});
