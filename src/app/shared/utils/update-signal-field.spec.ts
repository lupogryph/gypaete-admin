import {signal} from '@angular/core';
import {updateField} from './update-field';

describe('updateSignalField', () => {
  it('updates a typed field while preserving the rest of the signal value', () => {
    const dto = signal({name: 'Original', enabled: false});

    updateField(dto, 'name', 'Updated');

    expect(dto()).toEqual({name: 'Updated', enabled: false});
  });
});
