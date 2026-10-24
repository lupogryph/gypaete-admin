import {Component, inject, signal, viewChild} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatToolbar} from '@angular/material/toolbar';
import {
  ChambreDto,
  ChambresService,
} from '../../../openapi';
import {MatFormField, MatOption, MatSelect} from '@angular/material/select';
import {ChambreDashboard} from '../chambre-dashboard/chambre-dashboard';
import {Snackbar} from '../../../core/snackbar/snackbar';

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
  readonly snackBar = inject(Snackbar);

  readonly chambres = signal<ChambreDto[]>([]);
  readonly selectedChambre = signal<number>(this.chambres().length > 0 ? 0 : -2);
  readonly pendingDeleteNumero = signal<number | null>(null);
  readonly chambreDashboard = viewChild(ChambreDashboard);

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
        this.snackBar.error(error.error?.message);
      },
    });
  }

  select(value: number): void {
    this.selectedChambre.set(value);
    this.pendingDeleteNumero.set(null);
  }

  save(): void {
    this.chambreDashboard()?.save();
  }

  chambreSaved(chambre: ChambreDto): void {
    this.chambres.update((chambres) => {
      const index = chambres.findIndex(({numero}) => numero === chambre.numero);
      if (index < 0) {
        return [...chambres, chambre];
      }
      return chambres.map((existing, currentIndex) =>
        currentIndex === index ? chambre : existing,
      );
    });
    this.select(chambre.numero);
  }

  actionDisabled(s: number) {
    return this.saving || this.selectedChambre() < s;
  }

  saveDisabled() {
    return this.actionDisabled(-1)
  }

  deleteDisabled() {
    return this.actionDisabled(0);
  }

  delete(): void {
    const numero = this.selectedChambre();
    if (this.saving || numero < 0) {
      return;
    }

    if (this.pendingDeleteNumero() !== numero) {
      this.pendingDeleteNumero.set(numero);
      return;
    }

    this.pendingDeleteNumero.set(null);
    this.saving = true;
    this.chambresService.chambresControllerRemove(numero).subscribe({
      next: () => this.chambresDelete(numero),
      error: (error: {error?: {message?: string}}) => {
        this.saving = false;
        this.snackBar.error(error.error?.message);
      },
      complete: () => {
        this.saving = false;
      },
    });
  }

  chambresDelete(numero: number): void {
    this.chambres.update((chambres) => chambres.filter((chambre) => chambre.numero !== numero));
    if (this.selectedChambre() === numero) {
      this.selectedChambre.set(this.chambres()[0]?.numero ?? -2);
    }
    this.snackBar.success(`Chambre ${numero} supprimée`);
  }

}
