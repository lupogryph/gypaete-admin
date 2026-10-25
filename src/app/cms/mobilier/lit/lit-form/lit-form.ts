import {Component, effect, inject, input, signal, untracked} from '@angular/core';
import {form, FormField, FormRoot, required} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Snackbar} from '../../../../core/snackbar/snackbar';
import {CreateLitDto, LitDto, LitService} from '../../../../openapi';

@Component({
  imports: [
    FormField,
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatLabel,
    FormRoot,
  ],
  selector: 'app-lit-form',
  styleUrl: './lit-form.scss',
  templateUrl: './lit-form.html',
})
export class LitForm {
  private readonly litService = inject(LitService);
  private readonly snackBar = inject(Snackbar);

  readonly lit = input<LitDto>();

  readonly litModel = signal<CreateLitDto>({
    classe: '',
    largeur: 0,
  });

  readonly litForm = form(
    this.litModel,
    (fields) => {
      required(fields.classe);
      required(fields.largeur);
    },
    {
      submission: {
        action: async (field) => {
          const id = this.lit()?.id;
          const dto = field().value();
          const request = id === undefined
            ? this.litService.litControllerCreate(dto)
            : this.litService.litControllerUpdate(id.toString(), dto);
          request.subscribe({
            next: () => this.snackBar.success(id === undefined ? 'Lit ajouté' : 'Lit modifié'),
            error: (error) => this.snackBar.error(error),
          });
        }
      }
    });

  constructor() {
    effect(() => {
      const lit = this.lit();
      untracked(() => {
        this.litModel.set({
          classe: lit?.classe ?? '',
          largeur: lit?.largeur ?? 0,
        });
      });
    });
  }

}
