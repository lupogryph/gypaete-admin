import {inject, Service} from '@angular/core';
import {FrEnControls} from './fren-control';
import {TranslationService} from '../../../../core/translation/translation.service';

@Service()
export class FrenFormService {

  private translationService = inject(TranslationService);

  async addEn(controls: FrEnControls) {
    const sourceText = controls.fr.value;

    controls.hasEnglish.setValue(true);
    controls.translationError.setValue('');

    if (!sourceText.trim()) return;

    controls.translating.setValue(true);
    try {
      controls.en.setValue(await this.translationService.translate(sourceText, 'fr', 'en'));
    } catch (error: unknown) {
      const reason = error instanceof Error ? ` (${error.message})` : '';
      controls.translationError.setValue(
        `La traduction a échoué${reason}. Vous pouvez saisir le texte anglais manuellement.`,
      );
    } finally {
      controls.translating.setValue(false);
    }
  }

  deleteEn(controls: FrEnControls): void {
    controls.en.setValue('');
    controls.hasEnglish.setValue(false);
  }

}
