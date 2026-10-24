import {Component, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatToolbar} from '@angular/material/toolbar';
import {
  ChambreDto,
  ChambresService,
} from '../../../openapi';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatFormField, MatOption, MatSelect} from '@angular/material/select';
import {ChambreDashboard} from '../chambre-dashboard/chambre-dashboard';

@Component({
  imports: [
    MatButton,
    MatIcon,
    MatToolbar,
    MatSelect,
    MatOption,
    MatFormField,
    ChambreDashboard
  ],
  selector: 'app-chambres-dashboard',
  styleUrl: './chambres-dashboard.scss',
  templateUrl: './chambres-dashboard.html',
})
export class ChambresDashboard {
  readonly chambresService = inject(ChambresService);
  readonly snackBar = inject(MatSnackBar);

  readonly chambres = signal<ChambreDto[]>([]);
  readonly selectedChambre = signal<number>(this.chambres().length > 0 ? 0 : -2);

  saving = false;

  ngOnInit() {
    this.chambresService.chambresControllerFindAll().subscribe({
      next: (chambres) => {
        this.chambres.set(chambres);
        if (chambres.length > 0) {
          this.select(chambres[0].numero);
        }
      },
      error: (error: {error?: {message?: string}}) => {
        this.snackBar.open(
          `Échec : ${error.error?.message ?? 'Une erreur est survenue'}`,
          'Fermer',
          {duration: 10000, panelClass: ['red-snackbar']},
        );
      },
    });
  }

  select(value: number): void {
    this.selectedChambre.set(value);
  }

  save(): void {}

}
