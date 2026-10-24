import {Component, inject, input, output, signal} from '@angular/core';
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {PhotoDto} from '../../../../openapi';
import {PhotoUploadDialog, PhotoUploadRequest} from '../photo-upload-dialog/photo-upload-dialog';

@Component({
  imports: [MatFabButton, MatIcon],
  selector: 'app-gallery',
  styleUrl: './gallery.scss',
  templateUrl: './gallery.html',
})
export class Gallery {
  private readonly dialog = inject(MatDialog);

  readonly photos = input<PhotoDto[]>([]);
  readonly deletePhotos = output<PhotoDto[]>();
  readonly uploadRequested = output<PhotoUploadRequest>();
  protected readonly selection = signal<PhotoDto[]>([]);

  openUploadDialog(): void {
    this.dialog
      .open(PhotoUploadDialog, {width: 'min(500px, 95vw)'})
      .afterClosed()
      .subscribe((request) => {
        if (request) {
          this.uploadRequested.emit(request);
        }
      });
  }

  isSelected(photo: PhotoDto): boolean {
    return this.selection().some((selected) => selected.id === photo.id);
  }

  toggleSelection(photo: PhotoDto): void {
    const selected = this.isSelected(photo)
      ? this.selection().filter((item) => item.id !== photo.id)
      : [...this.selection(), photo];

    this.selection.set(selected);
  }

  deleteSelectedPhotos(): void {
    const selected = this.selection();
    if (selected.length === 0) {
      return;
    }

    this.deletePhotos.emit(selected);
    this.selection.set([]);
  }
}
