import {Component, inject, signal} from '@angular/core';
import {form, FormField, FormRoot, required} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
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
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
  ],
  selector: 'app-lit-form',
  styleUrl: './lit-form.scss',
  templateUrl: './lit-form.html',
})
export class LitForm {
  private readonly litService = inject(LitService);
  private readonly snackBar = inject(Snackbar);
  private readonly dialogRef = inject(MatDialogRef<LitForm, LitDto>);

  readonly lit = inject<LitDto | undefined>(MAT_DIALOG_DATA, {optional: true});

  readonly litModel = signal<CreateLitDto>({
    classe: this.lit?.classe ?? '',
    largeur: this.lit?.largeur ?? 0,
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
          const id = this.lit?.id;
          const dto = field().value();
          const request = id === undefined
            ? this.litService.litControllerCreate(dto)
            : this.litService.litControllerUpdate(id.toString(), dto);
          request.subscribe({
            next: (savedLit) => {
              this.snackBar.success(id === undefined ? 'Lit ajouté' : 'Lit modifié');
              this.dialogRef.close(savedLit);
            },
            error: (error) => this.snackBar.error(error),
          });
        }
      }
    });
}
