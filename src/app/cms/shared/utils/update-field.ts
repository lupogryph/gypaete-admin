import {WritableSignal} from '@angular/core';

export function updateField<T extends object, K extends keyof T>(
  dto: WritableSignal<T>,
  field: K,
  value: T[K],
): void {
  dto.update((current) => ({...current, [field]: value}));
}
