import {Component, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';

export interface PhotoUploadRequest {
  files: File[];
  url?: string;
}

@Component({
  selector: 'app-photo-upload-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
  ],
  templateUrl: './photo-upload-dialog.html',
  styleUrl: './photo-upload-dialog.scss',
})
export class PhotoUploadDialog {
  private readonly dialogRef = inject(MatDialogRef<PhotoUploadDialog, PhotoUploadRequest>);

  readonly files = signal<File[]>([]);
  readonly url = signal('');
  errorMessage: string | null = null;

  selectFiles(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.files.set(Array.from(input.files ?? []));
      this.errorMessage = null;
    }
  }

  updateUrl(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.url.set(input.value.trim());
      this.errorMessage = null;
    }
  }

  submit(): void {
    const url = this.url();
    if (url && !this.isHttpUrl(url)) {
      this.errorMessage = 'Saisissez une URL HTTP ou HTTPS valide.';
      return;
    }

    const files = this.files();
    if (files.length === 0 && !url) {
      this.errorMessage = 'Choisissez au moins une image ou saisissez une URL.';
      return;
    }

    this.dialogRef.close({files, ...(url ? {url} : {})});
  }

  private isHttpUrl(value: string): boolean {
    try {
      const parsedUrl = new URL(value);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
