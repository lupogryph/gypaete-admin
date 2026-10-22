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
      translatedParts.push(
        isLineBreak || !part.trim() ? part : await translator.translate(part),
      );
    }

    return translatedParts.join('');
  }
}
