import {Component, effect, model, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatTable, MatTableModule} from '@angular/material/table';
import {FrEn} from '../../../../openapi';
import {TranslationService} from '../../../../core/translation/translation.service';
import {createFrEnForm, FrEnForm} from '../utils/fren-control';
import {FrenFormService} from '../utils/fren-form-service';

@Component({
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatTableModule,
    ReactiveFormsModule,
    MatIconButton,
  ],
  selector: 'app-fren-table',
  styleUrl: './fren-table.scss',
  templateUrl: './fren-table.html',
})
export class FrenTable {
  readonly frens = model<FrEn[]>([]);

  @ViewChild(MatTable) private table?: MatTable<FrEnForm>;

  readonly displayedColumns = ['fren', 'actions'];
  readonly frensArray = new FormArray<FrEnForm>([]);

  constructor(private readonly frenFormService: FrenFormService) {
    effect(() => {
      const frens = this.frens();
      untracked(() => {
        if (!this.areEqual(this.formValue(), frens ?? [])) {
          this.setFrens(frens ?? []);
        }
      });
    });

    this.frensArray.valueChanges.subscribe(() => {
      this.frens.set(this.formValue());
    });
  }

  add(): void {
    this.frensArray.push(createFrEnForm());
    this.table?.renderRows();
  }

  remove(i: number): void {
    this.frensArray.removeAt(i);
    this.table?.renderRows();
  }

  async addEn(frenForm: FrEnForm): Promise<void> {
    this.frenFormService.addEn(frenForm.controls);
  }

  deleteEn(frenForm: FrEnForm): void {
    this.frenFormService.deleteEn(frenForm.controls);
  }

  private setFrens(frens: FrEn[]): void {
    this.frensArray.clear({emitEvent: false});
    this.frensArray.push(
      frens.map((fren) => createFrEnForm(fren)),
      {emitEvent: false},
    );
    this.table?.renderRows();
  }

  private formValue(): FrEn[] {
    return this.frensArray.getRawValue().map(({fr, en}) => ({
      fr,
      ...(en ? {en} : {}),
    }));
  }

  private areEqual(left: FrEn[], right: FrEn[]): boolean {
    return (
      left.length === right.length &&
      left.every((fren, index) => {
        const other = right[index];
        return fren.fr === other.fr && (fren.en ?? '') === (other.en ?? '');
      })
    );
  }
}
