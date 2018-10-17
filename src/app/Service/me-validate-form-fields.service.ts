import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl
} from "@angular/forms";

@Injectable()
export class MeValidateFormFieldsService {

  constructor() { }


    // -- validateAllFormFields -------------------------- ~start ---------------
    validateAllFormFields(formGroup: FormGroup) :void {
  
      Object.keys(formGroup.controls).forEach(field => {
    
        const control = formGroup.get(field); 
        if (control instanceof FormControl) {
            
          control.markAsTouched({ onlySelf: true });
  
        } else if (control instanceof FormGroup) {
    
          this.validateAllFormFields(control); 
        }
  
      });

             
    }
  
    // -- validateAllFormFields -------------------------- ~end ---------------

}
