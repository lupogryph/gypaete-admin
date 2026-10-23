import {Component, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatRipple} from '@angular/material/core';
import {MatList, MatListItem, MatListItemIcon} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatToolbar} from '@angular/material/toolbar';
import {DescriptionForm} from '../../shared/description-form/description-form';
import {ChaletDto, ChaletService, CreatePhotoDto, FrEn, PhotoDto, UpdateChaletDto} from '../../openapi';
import {Gallery} from '../../shared/photos/gallery/gallery';
import {PhotoUploadRequest} from '../../shared/photos/photo-upload-dialog/photo-upload-dialog';
import {Observable, defaultIfEmpty, forkJoin} from 'rxjs';
import {finalize, switchMap} from 'rxjs/operators';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {ConditionTable} from '../../shared/condition-table/condition-table';
import {FrenTable} from '../../shared/fren-table/fren-table';
import {updateField} from '../../shared/utils/update-field';

const dashList = [
  {id: 'general', label: 'General', icon: 'home'},
  {id: 'description', label: 'Description', icon: 'description'},
  {id: 'gallery', label: 'Gallerie', icon: 'photo_library'},
  {id: 'pets', label: 'Animaux', icon: 'pets'},
  {id: 'services', label: 'Prestations', icon: 'list'},
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
    Gallery,
    MatFormField,
    MatInput,
    MatLabel,
    MatSlideToggle,
    ConditionTable,
    FrenTable,
  ],
  selector: 'app-chalet',
  styleUrl: './chalet-dashboard.scss',
  templateUrl: './chalet-dashboard.html',
})
export class ChaletDashboard {

  readonly chalet = signal<ChaletDto>({
    nom: '',
    id: 0,
    photos: [],
  });

  readonly dashList = dashList;

  activeSection: DashboardSection = 'general';

  saving = false;

  constructor(
    private readonly chaletService: ChaletService,
    private readonly snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.chaletService.chaletControllerFind().subscribe((chalet) => {
      this.setChalet(chalet);
    });
  }

  private setChalet(chalet: ChaletDto): void {
    this.chalet.set({...chalet, photos: [...chalet.photos]});
  }

  update<K extends keyof ChaletDto>(
    field: K,
    value: ChaletDto[K],
  ): void {
    if (
      Array.isArray(value) &&
      value.length === 0 &&
      this.chalet()[field] === undefined
    ) {
      return;
    }
    updateField(this.chalet, field, value);
  }

  save(): void {
    if (this.saving) {
      return;
    }

    const {nom, nombrePersonnesBase, animauxAutorises, description, animaux} = this.chalet();
    const update: UpdateChaletDto = {
      nom,
      ...(nombrePersonnesBase !== undefined ? {nombrePersonnesBase} : {}),
      ...(animauxAutorises !== undefined ? {animauxAutorises} : {}),
      ...(description !== undefined ? {description} : {}),
      ...(animaux !== undefined ? {animaux} : {}),
    };
    this.saving = true;
    this.chaletService.chaletControllerUpdate(update).subscribe({
      next: (updatedChalet) => {
        this.setChalet(updatedChalet);
        this.snackBar.open('Sauvegardé', 'Fermer', {duration: 5000});
      },
      error: (error: { error?: { message?: string } }) => {
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

  // gallery

  addPhoto(url: string): Observable<unknown> {
    const photo: CreatePhotoDto = {url, thumbnailUrl: url};
    return this.chaletService.chaletControllerAddPhoto(photo);
  }

  uploadPhoto(file: File): Observable<unknown> {
    return this.chaletService.chaletControllerUploadPhoto(file);
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
        switchMap(() => this.chaletService.chaletControllerFind()),
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: (chalet) => {
          this.setChalet(chalet);
          this.snackBar.open('Photos ajoutées', 'Fermer', {duration: 5000});
        },
        error: (error: { error?: { message?: string } }) => this.showPhotoError(error),
      });
  }

  deletePhotos(photos: PhotoDto[]): void {
    this.saving = true;
    forkJoin(photos.map((photo) => this.deletePhoto(photo)))
      .pipe(
        switchMap(() => this.chaletService.chaletControllerFind()),
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: (chalet) => {
          this.setChalet(chalet);
          this.snackBar.open('Photos supprimées', 'Fermer', {duration: 5000});
        },
        error: (error: { error?: { message?: string } }) => this.showPhotoError(error),
      });
  }

  deletePhoto(photo: PhotoDto) {
    return this.chaletService.chaletControllerDeletePhoto(photo.id);
  }

  private showPhotoError(error: { error?: { message?: string } }): void {
    this.saving = false;
    this.snackBar.open(
      `Échec : ${error.error?.message ?? 'Une erreur est survenue'}`,
      'Fermer',
      {duration: 10000, panelClass: ['red-snackbar']},
    );
  }

}
