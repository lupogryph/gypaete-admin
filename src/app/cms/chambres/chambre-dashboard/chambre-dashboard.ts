import {Component, inject, input, output, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatRipple} from '@angular/material/core';
import {MatList, MatListItem, MatListItemIcon} from '@angular/material/list';
import {MatToolbar} from '@angular/material/toolbar';
import {ChambreDto, ChambresService, CreateChambreDto, CreatePhotoDto, PhotoDto} from '../../../openapi';
import {Gallery} from '../../shared/photos/gallery/gallery';
import {PhotoUploadRequest} from '../../shared/photos/photo-upload-dialog/photo-upload-dialog';
import {defaultIfEmpty, forkJoin, Observable} from 'rxjs';
import {finalize, switchMap} from 'rxjs/operators';
import {MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {ConditionTable} from '../../shared/forms/conditions/condition-table/condition-table';
import {FrenTable} from '../../shared/forms/fren-table/fren-table';
import {updateField} from '../../shared/utils/update-field';
import {PrestationPayanteTable} from '../../shared/forms/conditions/prestation-payante-table/prestation-payante-table';
import {StorageStatus} from '../../shared/photos/storage-status/storage-status';
import {MatSnackBar} from '@angular/material/snack-bar';

const dashList = [
  {id: 'general', label: 'General', icon: 'home'},
  {id: 'gallery', label: 'Gallerie', icon: 'photo_library'},
  {id: 'pets', label: 'Animaux', icon: 'pets'},
  {id: 'tarifs', label: 'Tarifs', icon: 'price_change'},
] as const;

type DashboardSection = (typeof dashList)[number]['id'];

@Component({
  imports: [
    MatButton,
    MatIcon,
    MatRipple,
    MatList,
    MatListItem,
    MatListItemIcon,
    MatToolbar,
    Gallery,
    MatFormField,
    MatInput,
    MatLabel,
    MatSlideToggle,
    ConditionTable,
    FrenTable,
    PrestationPayanteTable,
    StorageStatus,
    MatPrefix,
  ],
  selector: 'app-chambre-dashboard',
  styleUrl: './chambre-dashboard.scss',
  templateUrl: './chambre-dashboard.html',
})
export class ChambreDashboard {
  readonly chambreService = inject(ChambresService);
  readonly snackBar = inject(MatSnackBar);

  readonly numero = input<number>(-1);
  readonly saved = output<ChambreDto>();

  readonly chambre = signal<ChambreDto>({
    nom: "",
    numero: -1,
    photos: [],
    lits: []
  })

  readonly dashList = dashList;
  readonly storageRefreshKey = signal(0);

  activeSection: DashboardSection = 'general';

  saving = false;

  ngOnChanges(): void {
    const numero = this.numero();
    if (numero < 0) {
      this.chambre.set({nom: '', numero: -1, photos: [], lits: []});
      return;
    }

    this.chambreService.chambresControllerFindOne(numero).subscribe({
      next: (chambre) => this.chambre.set(chambre),
      error: (error: {error?: {message?: string}}) => this.showSaveError(error),
    });
  }

  save(): void {
    if (this.saving) {
      return;
    }

    const {numero, photos, lits, ...dto} = this.chambre();
    this.saving = true;
    const request = numero < 0
      ? this.chambreService.chambresControllerCreate(dto)
      : this.chambreService.chambresControllerUpdate(numero, dto);

    request.subscribe({
      next: (chambre) => {
        this.saved.emit(chambre);
        this.snackBar.open('Sauvegardé', 'Fermer', {duration: 5000});
      },
      error: (error: {error?: {message?: string}}) => {
        this.showSaveError(error);
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      },
    });
  }

  update<K extends keyof CreateChambreDto>(
    field: K,
    value: CreateChambreDto[K],
  ): void {
    if (
      Array.isArray(value) &&
      value.length === 0 &&
      this.chambre()[field] === undefined
    ) {
      return;
    }
    updateField(this.chambre, field, value);
  }

  // gallery

  addPhoto(url: string): Observable<unknown> {
    const photo: CreatePhotoDto = {url, thumbnailUrl: url};
    return this.chambreService.chambresControllerAddPhoto(this.numero(), photo);
  }

  uploadPhoto(file: File): Observable<unknown> {
    return this.chambreService.chambresControllerUploadPhoto(this.numero(), file);
  }

  uploadPhotos(request: PhotoUploadRequest): void {
    const uploads: Observable<unknown>[] = [];

    if (request.url) {
      uploads.push(this.addPhoto(request.url));
    }
    uploads.push(...request.files.map((file) => this.uploadPhoto(file)));
    if (uploads.length === 0) {
      return;
    }

    this.saving = true;
    forkJoin(uploads.map((upload) => upload.pipe(defaultIfEmpty(null))))
      .pipe(
        switchMap(() => this.chambreService.chambresControllerFindOne(this.numero())),
        finalize(() => {
          this.saving = false;
          this.storageRefreshKey.update((key) => key + 1);
        }),
      )
      .subscribe({
        next: (chambre) => {
          this.chambre.set(chambre);
          this.snackBar.open('Photos ajoutées', 'Fermer', {duration: 5000});
        },
        error: (error: { error?: { message?: string } }) => this.showPhotoError(error),
      });
  }

  deletePhotos(photos: PhotoDto[]):
    void {
    this.saving = true;
    forkJoin(photos.map((photo) => this.deletePhoto(photo))
    )
      .pipe(
        switchMap(() => this.chambreService.chambresControllerFindOne(this.numero())),
        finalize(() => {
          this.saving = false;
          this.storageRefreshKey.update((key) => key + 1);
        }),
      )
      .subscribe({
        next: (chambre) => {
          this.chambre.set(chambre);
          this.snackBar.open('Photos supprimées', 'Fermer', {duration: 5000});
        },
        error: (error: { error?: { message?: string } }) => this.showPhotoError(error),
      });
  }

  deletePhoto(photo: PhotoDto) {
    return this.chambreService.chambresControllerDeletePhoto(this.numero(), photo.id);
  }

  private showPhotoError(error: { error?: { message?: string } }):
    void {
    this.saving = false;
    this.snackBar.open(
      `Échec : ${error.error?.message ?? 'Une erreur est survenue'}`,
      'Fermer',
      {duration: 10000, panelClass: ['red-snackbar']},
    );
  }

  private showSaveError(error: {error?: {message?: string}}): void {
    this.snackBar.open(
      `Échec : ${error.error?.message ?? 'Une erreur est survenue'}`,
      'Fermer',
      {duration: 10000, panelClass: ['red-snackbar']},
    );
  }

}
