import {inject, Service} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Service()
export class Snackbar {
  readonly snackBar = inject(MatSnackBar);

  error(message: string | string[] | undefined): void {
    const details = Array.isArray(message) ? message.join('\n') : message;
    this.snackBar.open(
      `Échec :\n${details ?? 'Une erreur est survenue'}`,
      'Fermer',
      {duration: 10000, panelClass: ['red-snackbar'], horizontalPosition: "start"},
    );
  }

  success(message: string | string[] | undefined): void {
    const details = Array.isArray(message) ? message.join('\n') : message;
    this.snackBar.open(
      `${details ?? 'Succès'}`,
      'Fermer',
      {duration: 5000, panelClass: ['green-snackbar'], horizontalPosition: "start"});
  }

  saved() {
    this.success('Sauvegardé');
  }


}
