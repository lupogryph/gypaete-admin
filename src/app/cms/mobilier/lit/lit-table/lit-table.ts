import {Component, effect, input, model, signal, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatTable, MatTableModule} from '@angular/material/table';
import {LitChambreDto, LitDto} from '../../../../openapi';
import {LitStore} from '../lit-store/lit-store';

type LitChambreForm = FormGroup<{
  litId: FormControl<number | null>;
  lit: FormControl<LitDto | null>;
  nombre: FormControl<number>;
}>;

@Component({
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatTableModule,
    ReactiveFormsModule,
    LitStore,
  ],
  selector: 'app-lit-table',
  styleUrl: './lit-table.scss',
  templateUrl: './lit-table.html',
})
export class LitTable {
  readonly chambreNumero = input(-1);
  readonly lits = model<LitChambreDto[]>([]);
  availableLits = signal<LitDto[]>([]);

  @ViewChild(MatTable) private table?: MatTable<LitChambreForm>;

  readonly columns = ['lit', 'nombre', 'actions'];
  readonly formArray = new FormArray<LitChambreForm>([]);

  constructor() {
    effect(() => {
      const lits = this.lits();
      untracked(() => {
        if (!this.areEqual(this.formValue(), lits)) {
          this.setLits(lits);
        }
      });
    });

    this.formArray.valueChanges.subscribe(() => {
      this.lits.set(this.formValue());
    });
  }

  add(): void {
    this.formArray.push(this.createLitForm());
    this.table?.renderRows();
  }

  remove(index: number): void {
    this.formArray.removeAt(index);
    this.table?.renderRows();
  }

  selectLit(row: LitChambreForm, litId: number): void {
    const lit = this.availableLits().find((item) => item.id === litId) ?? null;
    row.controls.lit.setValue(lit);
    this.lits.set(this.formValue());
  }

  private createLitForm(dto?: LitChambreDto): LitChambreForm {
    return new FormGroup({
      litId: new FormControl(dto?.litId ?? null),
      lit: new FormControl<LitDto | null>(dto?.lit ?? null),
      nombre: new FormControl(dto?.nombre ?? 1, {nonNullable: true}),
    });
  }

  private setLits(lits: LitChambreDto[]): void {
    this.formArray.clear({emitEvent: false});
    this.formArray.push(lits.map((lit) => this.createLitForm(lit)), {emitEvent: false});
    this.table?.renderRows();
  }

  private formValue(): LitChambreDto[] {
    return this.formArray.controls.flatMap((row) => {
      const lit = row.controls.lit.value;
      if (!lit || row.controls.litId.value !== lit.id) {
        return [];
      }

      return [{
        chambreNumero: this.chambreNumero(),
        litId: lit.id,
        nombre: row.controls.nombre.value,
        lit,
      }];
    });
  }

  private areEqual(left: LitChambreDto[], right: LitChambreDto[]): boolean {
    return left.length === right.length && left.every((item, index) => {
      const other = right[index];
      return item.chambreNumero === other.chambreNumero &&
        item.litId === other.litId &&
        item.nombre === other.nombre;
    });
  }
}
