import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, of } from 'rxjs';

export function rePasswordValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const password = control.get('password') as FormControl;
    const rePassword = control.get('rePassword') as FormControl;
    if (rePassword.value !== password.value) {
      rePassword.setErrors({ different: true });
    } else {
      rePassword.setErrors(null);
    }
    return of(null);
  };
}
