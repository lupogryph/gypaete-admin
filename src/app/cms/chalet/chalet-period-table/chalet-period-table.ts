import {Component, effect, model, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef, MatFooterCell, MatFooterCellDef, MatFooterRow, MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatNativeDateModule, MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelect} from '@angular/material/select';
import {PeriodeDto, Temporalite} from '../../../openapi';

interface PeriodeControls {
  debut: FormControl<Date | null>;
  fin: FormControl<Date | null>;
  cout: FormControl<number>;
  par: FormControl<Temporalite | ''>;
}

type PeriodeForm = FormGroup<PeriodeControls>;

@Component({
  imports: [
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatDatepickerModule,
    MatFormFieldModule,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatInputModule,
    MatNativeDateModule,
    MatOption,
    MatRow,
    MatRowDef,
    MatSelect,
    MatTable,
    ReactiveFormsModule,
    MatFooterCell,
    MatFooterRow,
    MatFooterRowDef,
    MatFooterCellDef
  ],
  providers: [provideNativeDateAdapter()],
  selector: 'app-chalet-period-table',
  styleUrl: './chalet-period-table.scss',
  templateUrl: './chalet-period-table.html',
})
export class ChaletPeriodTable {
  readonly periodes = model<PeriodeDto[]>([]);

  @ViewChild(MatTable) private table?: MatTable<PeriodeForm>;

  readonly columns = ['periode', 'cout', 'par', 'actions'];
  readonly temporalites = Object.values(Temporalite);
  readonly formArray = new FormArray<PeriodeForm>([]);

  constructor() {
    effect(() => {
      const dtos = this.periodes();
      untracked(() => {
        if (!this.areEqual(this.formValue(), dtos ?? [])) {
          this.setTable(dtos ?? []);
        }
      });
    });

    this.formArray.valueChanges.subscribe(() => {
      const allPeriodsHaveDates = this.formArray.controls.every(
        (form) => form.controls.debut.value && form.controls.fin.value,
      );
      if (allPeriodsHaveDates) {
        this.periodes.set(this.formValue());
      }
    });
  }

  private setTable(dtos: PeriodeDto[]): void {
    this.formArray.clear({emitEvent: false});
    this.formArray.push(
      dtos.map((dto) => this.createForm(dto)),
      {emitEvent: false},
    );
  }

  add(): void {
    this.formArray.push(this.createForm());
    this.table?.renderRows();
  }

  remove(index: number): void {
    this.formArray.removeAt(index);
    this.table?.renderRows();
  }

  private createForm(dto?: PeriodeDto): PeriodeForm {
    return new FormGroup({
      debut: new FormControl<Date | null>(dto ? this.parseDate(dto.dateDebut) : null, {
        validators: [Validators.required],
      }),
      fin: new FormControl<Date | null>(dto ? this.parseDate(dto.dateFin) : null, {
        validators: [Validators.required],
      }),
      cout: new FormControl(dto?.cout ?? 0, {nonNullable: true}),
      par: new FormControl(dto?.par ?? '', {nonNullable: true}),
    });
  }

  private formValue(): PeriodeDto[] {
    return this.formArray.getRawValue()
      .flatMap(({debut, fin, cout, par}) =>
        debut && fin
          ? [{
            dateDebut: this.formatDate(debut),
            dateFin: this.formatDate(fin),
            cout,
            ...(par ? {par} : {}),
          }]
          : [],
      );
  }

  private parseDate(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      throw new Error(`Invalid period date: ${value}`);
    }
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      throw new Error(`Invalid period date: ${value}`);
    }
    return date;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private areEqual(left: PeriodeDto[], right: PeriodeDto[]): boolean {
    return (
      left.length === right.length &&
      left.every((dto, index) => {
        const other = right[index];
        return (
          dto.dateDebut === other.dateDebut &&
          dto.dateFin === other.dateFin &&
          dto.cout === other.cout &&
          (dto.par ?? '') === (other.par ?? '')
        );
      })
    );
  }
}
