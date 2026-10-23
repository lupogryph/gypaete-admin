import {Injectable} from '@angular/core';

interface BrowserTranslator {
  translate(text: string): Promise<string>;
}

interface BrowserTranslatorApi {
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<BrowserTranslator>;
}

@Injectable({providedIn: 'root'})
export class TranslationService {
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    if (!text.trim()) {
      return text;
    }

    const translatorApi = (globalThis as typeof globalThis & {
      Translator?: BrowserTranslatorApi;
    }).Translator;

    if (!translatorApi) {
      throw new Error('La traduction intégrée n’est pas disponible dans ce navigateur.');
    }

    const translator = await translatorApi.create({sourceLanguage, targetLanguage});
    const parts = text.split(/(\r\n|\r|\n)/);
    const translatedParts: string[] = [];

    for (const part of parts) {
      const isLineBreak = /^(?:\r\n|\r|\n)$/.test(part);
      if (isLineBreak || !part.trim()) {
        translatedParts.push(part);
        continue;
      }

      const translated = await translator.translate(part);
      translatedParts.push(this.preserveCapitalization(part, translated));
    }

    return translatedParts.join('');
  }

  private preserveCapitalization(source: string, translated: string): string {
    const letters = source.match(/\p{L}/gu) ?? [];
    if (letters.length > 0 && letters.every((letter) => letter === letter.toUpperCase())) {
      return translated.toUpperCase();
    }

    const firstLetter = source.match(/\p{L}/u)?.[0];
    if (firstLetter && firstLetter === firstLetter.toUpperCase()) {
      const characters = Array.from(translated);
      const translatedFirstLetterIndex = characters.findIndex(
        (character) => /\p{L}/u.test(character),
      );
      if (translatedFirstLetterIndex !== -1) {
        characters[translatedFirstLetterIndex] = characters[translatedFirstLetterIndex].toUpperCase();
        return characters.join('');
      }
    }

    return translated;
  }
}
