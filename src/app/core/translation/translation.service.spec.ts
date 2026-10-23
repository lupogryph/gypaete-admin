import {afterEach, describe, expect, it} from 'vitest';
import {TranslationService} from './translation.service';

const originalTranslator = Object.getOwnPropertyDescriptor(globalThis, 'Translator');

function mockTranslator(result: string): void {
  Object.defineProperty(globalThis, 'Translator', {
    configurable: true,
    value: {
      create: async () => ({
        translate: async () => result,
      }),
    },
  });
}

afterEach(() => {
  if (originalTranslator) {
    Object.defineProperty(globalThis, 'Translator', originalTranslator);
  } else {
    Reflect.deleteProperty(globalThis, 'Translator');
  }
});

describe('TranslationService', () => {
  const service = new TranslationService();

  it('preserves all-uppercase source text', async () => {
    mockTranslator('the chalet is available');

    await expect(service.translate('LE CHALET EST DISPONIBLE', 'fr', 'en'))
      .resolves.toBe('THE CHALET IS AVAILABLE');
  });

  it('preserves an initial capital letter', async () => {
    mockTranslator('the chalet is available');

    await expect(service.translate('Le chalet est disponible', 'fr', 'en'))
      .resolves.toBe('The chalet is available');
  });
});
