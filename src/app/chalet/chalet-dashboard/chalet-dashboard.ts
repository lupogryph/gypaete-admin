import {Component, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatRipple} from '@angular/material/core';
import {MatList, MatListItem, MatListItemIcon} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatToolbar} from '@angular/material/toolbar';
import {DescriptionForm} from '../../shared/description-form/description-form';
import {ChaletDto, ChaletService, FrEn, UpdateChaletDto} from '../../openapi';

const dashList = [
  {id: 'nom', label: 'Nom', icon: 'home'},
  {id: 'description', label: 'Description', icon: 'description'},
  {id: 'photos', label: 'Photos', icon: 'photo_library'},
] as const;

type DashboardSection = (typeof dashList)[number]['id'];

@Component({
  imports: [
    DescriptionForm,
    MatButton,
    MatIcon,
    MatRipple,
    MatList,
    MatListItem,
    MatListItemIcon,
    MatToolbar,
  ],
  selector: 'app-chalet',
  styleUrl: './chalet-dashboard.scss',
  templateUrl: './chalet-dashboard.html',
})
export class ChaletDashboard {
  chalet: ChaletDto | undefined;
  readonly description = signal<FrEn>({fr: ''});
  readonly dashList = dashList;
  activeSection: DashboardSection = 'nom';
  saving = false;

  constructor(
    private readonly chaletService: ChaletService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.chaletService.chaletControllerFind().subscribe((chalet) => {
      this.description.set(chalet.description ?? {fr: ''});
      this.chalet = {
        ...chalet,
        description: this.description(),
      };
    });
  }

  updateDescription(description: FrEn): void {
    this.description.set(description);
    if (this.chalet) {
      this.chalet.description = description;
    }
  }

  save(): void {
    if (!this.chalet || this.saving) {
      return;
    }

    const update: UpdateChaletDto = {
      nom: this.chalet.nom,
      description: this.description(),
    };
    this.saving = true;
    this.chaletService.chaletControllerUpdate(update).subscribe({
      next: (updatedChalet) => {
        this.snackBar.open('Sauvegardé', 'Fermer', {duration: 5000});
      },
      error: (error: {error?: {message?: string}}) => {
        this.saving = false;
        this.snackBar.open(
          `Échec : ${error.error?.message ?? 'Une erreur est survenue'}`,
          'Fermer',
          {duration: 10000, panelClass: ['red-snackbar']},
        );
      },
      complete: () => {
        this.saving = false;
      },
    });
  }
}
