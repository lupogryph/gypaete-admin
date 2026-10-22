import {Component, effect, model, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatTable, MatTableModule} from '@angular/material/table';
import {ConditionDto, Temporalite} from '../../openapi';
import {TranslationService} from '../../core/translation/translation.service';

type ConditionForm = FormGroup<{
  condition: FormGroup<{
    fr: FormControl<string>;
    en: FormControl<string>;
  }>;
  cout: FormControl<number>;
  par: FormControl<Temporalite | ''>;
  hasEnglish: FormControl<boolean>;
  translating: FormControl<boolean>;
  translationError: FormControl<string>;
}>;

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
  ],
  selector: 'app-condition-table',
  styleUrl: './condition-table.scss',
  templateUrl: './condition-table.html',
})
export class ConditionTable {
  readonly conditions = model<ConditionDto[]>([]);

  @ViewChild(MatTable) private table?: MatTable<ConditionForm>;

  readonly displayedColumns = ['condition', 'cout', 'par', 'actions'];
  readonly temporalites = Object.values(Temporalite);
  readonly conditionsArray = new FormArray<ConditionForm>([]);

  constructor(private readonly translationService: TranslationService) {
    effect(() => {
      const conditions = this.conditions();
      untracked(() => {
        if (!this.areEqual(this.formValue(), conditions ?? [])) {
          this.setConditions(conditions ?? []);
        }
      });
    });

    this.conditionsArray.valueChanges.subscribe(() => {
      this.conditions.set(this.formValue());
    });
  }

  add(): void {
    this.conditionsArray.push(this.createConditionForm());
    this.table?.renderRows();
  }

  remove(i: number): void {
    this.conditionsArray.removeAt(i);
    this.table?.renderRows();
  }

  async addEn(conditionForm: ConditionForm): Promise<void> {
    const {fr, en} = conditionForm.controls.condition.controls;
    const sourceText = fr.value;
    conditionForm.controls.hasEnglish.setValue(true);
    conditionForm.controls.translationError.setValue('');

    if (!sourceText.trim()) {
      return;
    }

    conditionForm.controls.translating.setValue(true);
    try {
      en.setValue(await this.translationService.translate(sourceText, 'fr', 'en'));
    } catch (error: unknown) {
      const reason = error instanceof Error ? ` (${error.message})` : '';
      conditionForm.controls.translationError.setValue(
        `La traduction a échoué${reason}. Vous pouvez saisir le texte anglais manuellement.`,
      );
    } finally {
      conditionForm.controls.translating.setValue(false);
    }
  }

  deleteEn(conditionForm: ConditionForm) {
    conditionForm.controls.condition.controls.en.setValue('');
    conditionForm.controls.hasEnglish.setValue(false);
  }

  private createConditionForm(condition?: ConditionDto): ConditionForm {
    return new FormGroup({
      condition: new FormGroup({
        fr: new FormControl(condition?.condition.fr ?? '', {nonNullable: true}),
        en: new FormControl(condition?.condition.en ?? '', {nonNullable: true}),
      }),
      cout: new FormControl(condition?.cout ?? 0, {nonNullable: true}),
      par: new FormControl(condition?.par ?? '', {nonNullable: true}),
      hasEnglish: new FormControl(condition?.condition.en !== undefined, {nonNullable: true}),
      translating: new FormControl(false, {nonNullable: true}),
      translationError: new FormControl('', {nonNullable: true}),
    });
  }

  private setConditions(conditions: ConditionDto[]): void {
    this.conditionsArray.clear({emitEvent: false});
    this.conditionsArray.push(
      conditions.map((condition) => this.createConditionForm(condition)),
      {emitEvent: false},
    );
    this.table?.renderRows();
  }

  private formValue(): ConditionDto[] {
    return this.conditionsArray.getRawValue().map(({condition, cout, par}) => ({
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
