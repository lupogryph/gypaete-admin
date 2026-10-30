import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Snackbar } from '../../../../core/snackbar/snackbar';
import { LitDto, LitService } from '../../../../openapi';
import { LitForm } from './lit-form';

describe('LitForm', () => {
  let component: LitForm;
  let fixture: ComponentFixture<LitForm>;

  beforeEach(async () => {
    const lit: LitDto = {id: 1, classe: 'Simple', largeur: 90};
    await TestBed.configureTestingModule({
      imports: [LitForm],
      providers: [
        {
          provide: LitService,
          useValue: {
            litControllerCreate: () => of(lit),
            litControllerUpdate: () => of(lit),
          },
        },
        {provide: Snackbar, useValue: {success: vi.fn(), error: vi.fn()}},
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(LitForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
