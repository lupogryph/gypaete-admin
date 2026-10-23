import {Component, effect, model, untracked, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatTable, MatTableModule} from '@angular/material/table';
import {FrEn} from '../../openapi';
import {TranslationService} from '../../core/translation/translation.service';

type FrenForm = FormGroup<{
  fr: FormControl<string>;
  en: FormControl<string>;
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

  @ViewChild(MatTable) private table?: MatTable<FrenForm>;

  readonly displayedColumns = ['fren', 'actions'];
  readonly frensArray = new FormArray<FrenForm>([]);

  constructor(private readonly translationService: TranslationService) {
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
    this.frensArray.push(this.createFrenForm());
    this.table?.renderRows();
  }

  remove(i: number): void {
    this.frensArray.removeAt(i);
    this.table?.renderRows();
  }

  async addEn(frenForm: FrenForm): Promise<void> {
    const sourceText = frenForm.controls.fr.value;
    frenForm.controls.hasEnglish.setValue(true);
    frenForm.controls.translationError.setValue('');

    if (!sourceText.trim()) {
      return;
    }

    frenForm.controls.translating.setValue(true);
    try {
      frenForm.controls.en.setValue(
        await this.translationService.translate(sourceText, 'fr', 'en'),
      );
    } catch (error: unknown) {
      const reason = error instanceof Error ? ` (${error.message})` : '';
      frenForm.controls.translationError.setValue(
        `La traduction a échoué${reason}. Vous pouvez saisir le texte anglais manuellement.`,
      );
    } finally {
      frenForm.controls.translating.setValue(false);
    }
  }

  deleteEn(frenForm: FrenForm): void {
    frenForm.controls.en.setValue('');
    frenForm.controls.hasEnglish.setValue(false);
  }

  private createFrenForm(fren?: FrEn): FrenForm {
    return new FormGroup({
      fr: new FormControl(fren?.fr ?? '', {nonNullable: true}),
      en: new FormControl(fren?.en ?? '', {nonNullable: true}),
      hasEnglish: new FormControl(fren?.en !== undefined, {nonNullable: true}),
      translating: new FormControl(false, {nonNullable: true}),
      translationError: new FormControl('', {nonNullable: true}),
    });
  }

  private setFrens(frens: FrEn[]): void {
    this.frensArray.clear({emitEvent: false});
    this.frensArray.push(
      frens.map((fren) => this.createFrenForm(fren)),
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
