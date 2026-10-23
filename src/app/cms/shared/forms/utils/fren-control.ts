import {FormControl, FormGroup} from '@angular/forms';
import {ConditionDto, FrEn, Temporalite} from '../../../../openapi';

export interface FrEnControls {
  fr: FormControl<string>;
  en: FormControl<string>;
  hasEnglish: FormControl<boolean>;
  translating: FormControl<boolean>;
  translationError: FormControl<string>;
}

export type FrEnForm = FormGroup<FrEnControls>;

export interface FrEnConditionControls {
  condition: FormGroup<FrEnControls>;
  cout: FormControl<number>;
  par: FormControl<Temporalite | ''>;
}

export type FrEnConditionForm = FormGroup<FrEnConditionControls>;

export function createFrEnForm(value?: FrEn): FrEnForm {
  return new FormGroup({
    fr: new FormControl(value?.fr ?? '', {nonNullable: true}),
    en: new FormControl(value?.en ?? '', {nonNullable: true}),
    hasEnglish: new FormControl(value?.en !== undefined, {nonNullable: true}),
    translating: new FormControl(false, {nonNullable: true}),
    translationError: new FormControl('', {nonNullable: true}),
  });
}

