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
    row.controls.litId.setValue(litId);
    row.controls.lit.setValue(lit);
    this.lits.set(this.formValue());
  }

  availableLitsFor(row: LitChambreForm): LitDto[] {
    const selectedByOtherRows = new Set(
      this.formArray.controls
        .filter((otherRow) => otherRow !== row)
        .map((otherRow) => otherRow.controls.litId.value)
        .filter((id): id is number => id !== null),
    );

    return this.availableLits().filter((lit) =>
      lit.id === row.controls.litId.value || !selectedByOtherRows.has(lit.id),
    );
  }

  private createLitForm(dto?: LitChambreDto): LitChambreForm {
    const lit = dto?.lit ?? this.availableLits().find((availableLit) =>
      !this.formArray.controls.some((row) => row.controls.litId.value === availableLit.id),
    ) ?? null;

    return new FormGroup({
      litId: new FormControl(dto?.litId ?? lit?.id ?? null),
      lit: new FormControl<LitDto | null>(lit),
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
      const litId = row.controls.litId.value;
      const lit = this.availableLits().find((item) => item.id === litId) ?? row.controls.lit.value;
      if (!lit || litId !== lit.id) {
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
