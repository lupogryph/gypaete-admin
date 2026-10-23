import {Component, effect, model, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatTable, MatTableModule} from '@angular/material/table';
import {PrestationPayanteDto, Temporalite} from '../../../../../openapi';
import {MatCheckbox} from '@angular/material/checkbox';
import {FrEnConditionControls} from '../../utils/fren-control';
import {FrenFormService} from '../../utils/fren-form-service';

interface PresationPayanteControls extends FrEnConditionControls {
  cout: FormControl<number>;
  par: FormControl<Temporalite | ''>;
  parPersonne: FormControl<boolean>;
}

type PresationPayanteForm = FormGroup<PresationPayanteControls>;

@Component({
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatTableModule,
    ReactiveFormsModule,
    MatIconButton,
    MatCheckbox,
  ],
  selector: 'app-prestation-payante-table',
  styleUrl: './prestation-payante-table.scss',
  templateUrl: './prestation-payante-table.html',
})
export class PrestationPayanteTable {
  readonly prestations = model<PrestationPayanteDto[]>([]);

  @ViewChild(MatTable) private table?: MatTable<PresationPayanteForm>;

  readonly columns = ['condition', 'cout', 'par', 'parPersonne', 'actions'];
  readonly temporalites = Object.values(Temporalite);
  readonly formArray = new FormArray<PresationPayanteForm>([]);

  constructor(private readonly frenFormService: FrenFormService) {
    effect(() => {
      const conditions = this.prestations();
      untracked(() => {
        if (!this.areEqual(this.formValue(), conditions ?? [])) {
          this.setConditions(conditions ?? []);
        }
      });
    });

    this.formArray.valueChanges.subscribe(() => {
      this.prestations.set(this.formValue());
    });
  }

  add(): void {
    this.formArray.push(this.createForm());
    this.table?.renderRows();
  }

  remove(i: number): void {
    this.formArray.removeAt(i);
    this.table?.renderRows();
  }

  async addEn(form: PresationPayanteForm): Promise<void> {
    this.frenFormService.addEn(form.controls.condition.controls);
  }

  deleteEn(form: PresationPayanteForm) {
    this.frenFormService.deleteEn(form.controls.condition.controls);
  }

  private createForm(dto?: PrestationPayanteDto): PresationPayanteForm {
    return new FormGroup({
      condition: new FormGroup({
        fr: new FormControl(dto?.condition.fr ?? '', {nonNullable: true}),
        en: new FormControl(dto?.condition.en ?? '', {nonNullable: true}),
        hasEnglish: new FormControl(dto?.condition.en !== undefined, {nonNullable: true}),
        translating: new FormControl(false, {nonNullable: true}),
        translationError: new FormControl('', {nonNullable: true}),
      }),
      cout: new FormControl(dto?.cout ?? 0, {nonNullable: true}),
      par: new FormControl(dto?.par ?? '', {nonNullable: true}),
      parPersonne: new FormControl(dto?.parPersonne ?? false, {nonNullable: true}),
    });
  }

  private setConditions(dtos: PrestationPayanteDto[]): void {
    this.formArray.clear({emitEvent: false});
    this.formArray.push(
      dtos.map((condition) => this.createForm(condition)),
      {emitEvent: false},
    );
    this.table?.renderRows();
  }

  private formValue(): PrestationPayanteDto[] {
    return this.formArray.getRawValue().map(({condition, cout, par, parPersonne}) => ({
      condition: {
        fr: condition.fr,
        ...(condition.en ? {en: condition.en} : {}),
      },
      cout,
      ...(par ? {par} : {}),
      parPersonne,
    }));
  }

  private areEqual(left: PrestationPayanteDto[], right: PrestationPayanteDto[]): boolean {
    return (
      left.length === right.length &&
      left.every((dto, index) => {
        const other = right[index];
        return (
          dto.condition.fr === other.condition.fr &&
          (dto.condition.en ?? '') === (other.condition.en ?? '') &&
          dto.cout === other.cout &&
          (dto.par ?? '') === (other.par ?? '') &&
          (dto.parPersonne ?? '') === (other.parPersonne ?? '')
        );
      })
    );
  }

}
