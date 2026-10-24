import {Component, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatRipple} from '@angular/material/core';
import {MatList, MatListItem, MatListItemIcon} from '@angular/material/list';
import {MatToolbar} from '@angular/material/toolbar';
import {DescriptionForm} from '../../shared/forms/description-form/description-form';
import {ChaletDto, ChaletService, CreateChaletDto, CreatePhotoDto, PhotoDto} from '../../../openapi';
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
import {ChaletPeriodTable} from '../chalet-period-table/chalet-period-table';
import {StorageStatus} from '../../shared/photos/storage-status/storage-status';
import {Snackbar} from '../../../core/snackbar/snackbar';

const dashList = [
  {id: 'general', label: 'General', icon: 'home'},
  {id: 'description', label: 'Description', icon: 'description'},
  {id: 'gallery', label: 'Gallerie', icon: 'photo_library'},
  {id: 'pets', label: 'Animaux', icon: 'pets'},
  {id: 'services', label: 'Prestations', icon: 'hand_meal'},
  {id: 'paid-services', label: 'Prestations Payantes', icon: 'payments'},
  {id: 'tarifs', label: 'Tarifs', icon: 'price_change'},
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
    PrestationPayanteTable,
    ChaletPeriodTable,
    StorageStatus,
    MatPrefix,
  ],
  selector: 'app-chalet',
  styleUrl: './chalet-dashboard.scss',
  templateUrl: './chalet-dashboard.html',
})
export class ChaletDashboard {
  readonly chaletService = inject(ChaletService);
  readonly snackBar = inject(Snackbar);

  readonly chalet = signal<ChaletDto>({
    nom: '',
    id: 0,
    photos: [],
  });

  readonly dashList = dashList;
  readonly storageRefreshKey = signal(0);

  activeSection: DashboardSection = 'general';

  saving = false;

  ngOnInit() {
    this.chaletService.chaletControllerFind().subscribe((chalet) => {
      this.setChalet(chalet);
    });
  }

  private setChalet(chalet: ChaletDto): void {
    this.chalet.set(chalet);
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
    const update: CreateChaletDto = this.chalet();
    this.saving = true;
    this.chaletService.chaletControllerUpdate(update).subscribe({
      next: (updatedChalet) => {
        this.setChalet(updatedChalet);
        this.snackBar.success('Sauvegardé');
      },
      error: (error: { error?: { message?: string } }) => {
        this.saving = false;
        this.snackBar.error(error.error?.message);
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
          this.storageRefreshKey.update((key) => key + 1);
        }),
      )
      .subscribe({
        next: (chalet) => {
          this.setChalet(chalet);
          this.snackBar.success('Photos ajoutées');
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
          this.storageRefreshKey.update((key) => key + 1);
        }),
      )
      .subscribe({
        next: (chalet) => {
          this.setChalet(chalet);
          this.snackBar.success('Photos supprimées');
        },
        error: (error: { error?: { message?: string } }) => this.showPhotoError(error),
      });
  }

  deletePhoto(photo: PhotoDto) {
    return this.chaletService.chaletControllerDeletePhoto(photo.id);
  }

  private showPhotoError(error: { error?: { message?: string } }): void {
    this.saving = false;
    this.snackBar.error(error.error?.message);
  }

}
