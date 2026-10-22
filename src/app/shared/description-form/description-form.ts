import {Component, effect, model, signal, untracked} from '@angular/core';
import {FormField, form} from '@angular/forms/signals';
import {FrEn} from '../../openapi';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {TranslationService} from '../../core/translation/translation.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  imports: [FormField, MatFormField, MatLabel, MatInput, MatIcon, MatIconButton],
  selector: 'app-description-form',
  styleUrl: './description-form.scss',
  templateUrl: './description-form.html',
})
export class DescriptionForm {
  readonly description = model<FrEn | undefined>(undefined);
  private readonly formModel = signal({fr: '', en: ''});
  readonly hasEnglish = signal(false);
  readonly descriptionForm = form(this.formModel);
  translating = false;
  translationError: string | null = null;

  constructor(private readonly translationService: TranslationService) {
    effect(() => {
      const description = this.description();
      const fr = description?.fr ?? '';
      const en = description?.en ?? '';
      untracked(() => {
        const current = this.formModel();
        if (current.fr !== fr || current.en !== en) {
          this.formModel.set({fr, en});
        }
        this.hasEnglish.set(description?.en !== undefined);
      });
    });

    effect(() => {
      const {fr, en} = this.formModel();
      this.description.set(
        this.hasEnglish() ? {fr, en} : fr ? {fr} : undefined,
      );
    });
  }

  async addEn(): Promise<void> {
    const sourceText = this.formModel().fr;
    this.hasEnglish.set(true);
    this.formModel.update((value) => ({...value, en: ''}));
    this.translationError = null;

    if (!sourceText.trim()) {
      return;
    }

    this.translating = true;
    try {
      const translatedText = await this.translationService.translate(sourceText, 'fr', 'en');
      this.formModel.update((value) => ({...value, en: translatedText}));
    } catch (error: unknown) {
      const reason = error instanceof Error ? ` (${error.message})` : '';
      this.translationError = `La traduction a échoué${reason}. Vous pouvez saisir le texte anglais manuellement.`;
    } finally {
      this.translating = false;
    }
  }

  deleteEn() {
    this.formModel.update((value) => ({...value, en: ''}));
    this.hasEnglish.set(false);
  }
}
