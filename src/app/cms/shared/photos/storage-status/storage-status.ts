import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatProgressBar} from '@angular/material/progress-bar';
import {PhotoService, SpaceDto} from '../../../../openapi';
import {FileSizePipe} from '../../../../pipes/file-size-pipe';

@Component({
  imports: [MatProgressBar, FileSizePipe],
  selector: 'app-storage-status',
  styleUrl: './storage-status.scss',
  templateUrl: './storage-status.html',
})
export class StorageStatus {
  private readonly service = inject(PhotoService);
  readonly refreshKey = input(0);
  readonly space = signal<SpaceDto | null>(null);
  readonly error = signal<string | null>(null);

  readonly usedPercentage = computed(() => {
    const space = this.space();
    return space && space.total > 0
      ? Math.round(Math.min(100, Math.max(0, (space.used / space.total) * 100)))
      : 0;
  });

  constructor() {
    effect((onCleanup) => {
      this.refreshKey();
      this.error.set(null);
      const subscription = this.service.photoControllerGetSpace().subscribe({
        next: (space) => this.space.set(space),
        error: () => this.error.set('Impossible de récupérer l’espace de stockage.'),
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }
}
