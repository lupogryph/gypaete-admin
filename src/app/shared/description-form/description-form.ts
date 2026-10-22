import {Component, model} from '@angular/core';
import {FormField, form} from '@angular/forms/signals';
import {FrEn} from '../../openapi';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

@Component({
  imports: [FormField, MatFormField, MatLabel, MatInput, MatButton],
  selector: 'app-description-form',
  styleUrl: './description-form.scss',
  templateUrl: './description-form.html',
})
export class DescriptionForm {
  readonly description = model<FrEn>({fr: ''});
  readonly descriptionForm = form(this.description);

  addEn() {
    this.description.update((value) => ({...value, en: ''}));
  }
}
