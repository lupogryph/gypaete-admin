import {Component, inject, model, signal} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {
  MatDivider,
  MatList,
  MatListItem, MatListItemIcon,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import {Snackbar} from '../../../../core/snackbar/snackbar';
import {LitDto, LitService} from '../../../../openapi';
import {LitForm} from '../lit-form/lit-form';

@Component({
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatList,
    MatListItem,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
    MatListItemIcon,
    MatDivider,
  ],
  selector: 'app-lit-store',
  styleUrl: './lit-store.scss',
  templateUrl: './lit-store.html',
})
export class LitStore {
  private readonly litService = inject(LitService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(Snackbar);

  readonly lits = model<LitDto[]>([]);
  readonly pendingDeleteId = signal<number | null>(null);
  readonly deletingLitId = signal<number | null>(null);

  ngOnInit(): void {
    this.litService.litControllerFindAll().subscribe({
      next: (lits) => this.lits.set(lits),
      error: (error: {error?: {message?: string}}) => this.snackBar.error(error.error?.message),
    });
  }

  openLitDialog(lit?: LitDto): void {
    this.dialog
      .open<LitForm, LitDto | undefined, LitDto>(LitForm, {
        data: lit,
        width: 'min(500px, 95vw)',
      })
      .afterClosed()
      .subscribe((savedLit) => {
        if (savedLit) {
          this.lits.update((lits) => {
            const existingIndex = lits.findIndex(({id}) => id === savedLit.id);
            if (existingIndex < 0) {
              return [...lits, savedLit];
            }
            return lits.map((existing) => existing.id === savedLit.id ? savedLit : existing);
          });
        }
      });
  }

  deleteLit(lit: LitDto): void {
    if (this.deletingLitId() === lit.id) {
      return;
    }

    if (this.pendingDeleteId() !== lit.id) {
      this.pendingDeleteId.set(lit.id);
      return;
    }

    this.pendingDeleteId.set(null);
    this.deletingLitId.set(lit.id);
    this.litService.litControllerRemove(lit.id.toString()).subscribe({
      next: () => {
        this.lits.update((lits) => lits.filter(({id}) => id !== lit.id));
        this.snackBar.success(`Lit ${lit.classe} supprimé`);
      },
      error: (error: {error?: {message?: string}}) => {
        this.deletingLitId.set(null);
        this.snackBar.error(error.error?.message);
      },
      complete: () => this.deletingLitId.set(null),
    });
  }
}
