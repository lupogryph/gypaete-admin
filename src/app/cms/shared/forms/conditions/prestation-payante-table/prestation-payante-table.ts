import {Component, effect, model, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatTable, MatTableModule} from '@angular/material/table';
import {PrestationPayanteDto, Temporalite} from '../../../../../openapi';
import {TranslationService} from '../../../../../core/translation/translation.service';
import {MatCheckbox} from '@angular/material/checkbox';

type PresationPayanteForm = FormGroup<{
  condition: FormGroup<{
    fr: FormControl<string>;
    en: FormControl<string>;
  }>;
  cout: FormControl<number>;
  par: FormControl<Temporalite | ''>;
  parPersonne: FormControl<boolean>;
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
    MatCheckbox,
  ],
  selector: 'app-prestation-payante-table',
  styleUrl: './prestation-payante-table.scss',
  templateUrl: './prestation-payante-table.html',
})
export class PrestationPayanteTable {
  readonly prestations = model<PrestationPayanteDto[]>([]);

  @ViewChild(MatTable) private table?: MatTable<PresationPayanteForm>;

  readonly displayedColumns = ['condition', 'cout', 'par', 'parPersonne', 'actions'];
  readonly temporalites = Object.values(Temporalite);
  readonly conditionsArray = new FormArray<PresationPayanteForm>([]);

  constructor(private readonly translationService: TranslationService) {
    effect(() => {
      const conditions = this.prestations();
      untracked(() => {
        if (!this.areEqual(this.formValue(), conditions ?? [])) {
          this.setConditions(conditions ?? []);
        }
      });
    });

    this.conditionsArray.valueChanges.subscribe(() => {
      this.prestations.set(this.formValue());
    });
  }

  add(): void {
    this.conditionsArray.push(this.createForm());
    this.table?.renderRows();
  }

  remove(i: number): void {
    this.conditionsArray.removeAt(i);
    this.table?.renderRows();
  }

  async addEn(form: PresationPayanteForm): Promise<void> {
    const {fr, en} = form.controls.condition.controls;
    const sourceText = fr.value;
    form.controls.hasEnglish.setValue(true);
    form.controls.translationError.setValue('');

    if (!sourceText.trim()) {
      return;
    }

    form.controls.translating.setValue(true);
    try {
      en.setValue(await this.translationService.translate(sourceText, 'fr', 'en'));
    } catch (error: unknown) {
      const reason = error instanceof Error ? ` (${error.message})` : '';
      form.controls.translationError.setValue(
        `La traduction a échoué${reason}. Vous pouvez saisir le texte anglais manuellement.`,
      );
    } finally {
      form.controls.translating.setValue(false);
    }
  }

  deleteEn(form: PresationPayanteForm) {
    form.controls.condition.controls.en.setValue('');
    form.controls.hasEnglish.setValue(false);
  }

  private createForm(dto?: PrestationPayanteDto): PresationPayanteForm {
    return new FormGroup({
      condition: new FormGroup({
        fr: new FormControl(dto?.condition.fr ?? '', {nonNullable: true}),
        en: new FormControl(dto?.condition.en ?? '', {nonNullable: true}),
      }),
      cout: new FormControl(dto?.cout ?? 0, {nonNullable: true}),
      par: new FormControl(dto?.par ?? '', {nonNullable: true}),
      parPersonne: new FormControl(dto?.parPersonne ?? false, {nonNullable: true}),
      hasEnglish: new FormControl(dto?.condition.en !== undefined, {nonNullable: true}),
      translating: new FormControl(false, {nonNullable: true}),
      translationError: new FormControl('', {nonNullable: true}),
    });
  }

  private setConditions(dtos: PrestationPayanteDto[]): void {
    this.conditionsArray.clear({emitEvent: false});
    this.conditionsArray.push(
      dtos.map((condition) => this.createForm(condition)),
      {emitEvent: false},
    );
    this.table?.renderRows();
  }

  private formValue(): PrestationPayanteDto[] {
    return this.conditionsArray.getRawValue().map(({condition, cout, par, parPersonne}) => ({
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
