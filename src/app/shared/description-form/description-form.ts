import {Component, effect, model, signal, untracked} from '@angular/core';
import {FormField, form} from '@angular/forms/signals';
import {FrEn} from '../../openapi';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {TranslationService} from '../../core/translation/translation.service';

@Component({
  imports: [FormField, MatFormField, MatLabel, MatInput, MatButton],
  selector: 'app-description-form',
  styleUrl: './description-form.scss',
  templateUrl: './description-form.html',
})
export class DescriptionForm {
  readonly description = model<FrEn>({fr: ''});
  private readonly formModel = signal({fr: '', en: ''});
  readonly hasEnglish = signal(false);
  readonly descriptionForm = form(this.formModel);
  translating = false;
  translationError: string | null = null;

  constructor(private readonly translationService: TranslationService) {
    effect(() => {
      const description = this.description();
      const en = description.en ?? '';
      untracked(() => {
        const current = this.formModel();
        if (current.fr !== description.fr || current.en !== en) {
          this.formModel.set({fr: description.fr, en});
        }
        this.hasEnglish.set(description.en !== undefined);
      });
    });

    effect(() => {
      const {fr, en} = this.formModel();
      this.description.set(this.hasEnglish() ? {fr, en} : {fr});
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
}
