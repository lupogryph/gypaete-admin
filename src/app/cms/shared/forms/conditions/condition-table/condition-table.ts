import {Component, effect, inject, model, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatTable, MatTableModule} from '@angular/material/table';
import {ConditionDto, Temporalite} from '../../../../../openapi';
import {createFrEnForm, FrEnConditionControls} from '../../utils/fren-control';
import {FrenFormService} from '../../utils/fren-form-service';

type ConditionForm = FormGroup<FrEnConditionControls>;

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
    MatSuffix,
  ],
  selector: 'app-condition-table',
  styleUrl: './condition-table.scss',
  templateUrl: './condition-table.html',
})
export class ConditionTable {
  private readonly frenFormService = inject(FrenFormService);

  readonly conditions = model<ConditionDto[]>([]);

  @ViewChild(MatTable) private table?: MatTable<ConditionForm>;

  readonly columns = ['condition', 'cout', 'par', 'actions'];
  readonly temporalites = Object.values(Temporalite);
  readonly formArray = new FormArray<ConditionForm>([]);

  constructor() {
    effect(() => {
      const conditions = this.conditions();
      untracked(() => {
        if (!this.areEqual(this.formValue(), conditions ?? [])) {
          this.setConditions(conditions ?? []);
        }
      });
    });

    this.formArray.valueChanges.subscribe(() => {
      this.conditions.set(this.formValue());
    });
  }

  add(): void {
    this.formArray.push(this.createConditionForm());
    this.table?.renderRows();
  }

  remove(i: number): void {
    this.formArray.removeAt(i);
    this.table?.renderRows();
  }

  async addEn(conditionForm: ConditionForm) {
    await this.frenFormService.addEn(conditionForm.controls.condition.controls);
  }

  deleteEn(conditionForm: ConditionForm) {
    this.frenFormService.deleteEn(conditionForm.controls.condition.controls);
  }

  private createConditionForm(dto?: ConditionDto): ConditionForm {
    return new FormGroup({
      condition: createFrEnForm(dto?.condition),
      cout: new FormControl(dto?.cout ?? 0, {nonNullable: true}),
      par: new FormControl(dto?.par ?? '', {nonNullable: true}),
    });
  }

  private setConditions(conditions: ConditionDto[]): void {
    this.formArray.clear({emitEvent: false});
    this.formArray.push(
      conditions.map((condition) => this.createConditionForm(condition)),
      {emitEvent: false},
    );
    this.table?.renderRows();
  }

  private formValue(): ConditionDto[] {
    return this.formArray.getRawValue().map(({condition, cout, par}) => ({
      condition: {
        fr: condition.fr,
        ...(condition.en ? {en: condition.en} : {}),
      },
      cout,
      ...(par ? {par} : {}),
    }));
  }

  private areEqual(left: ConditionDto[], right: ConditionDto[]): boolean {
    return (
      left.length === right.length &&
      left.every((condition, index) => {
        const other = right[index];
        return (
          condition.condition.fr === other.condition.fr &&
          (condition.condition.en ?? '') === (other.condition.en ?? '') &&
          condition.cout === other.cout &&
          (condition.par ?? '') === (other.par ?? '')
        );
      })
    );
  }

}
