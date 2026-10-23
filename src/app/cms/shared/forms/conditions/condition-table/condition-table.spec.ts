import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConditionDto, Temporalite } from '../../../../../openapi';
import { TranslationService } from '../../../../../core/translation/translation.service';
import { ConditionTable } from './condition-table';

describe('PrestationPayanteTable', () => {
  let component: ConditionTable;
  let fixture: ComponentFixture<ConditionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionTable],
      providers: [
        {
          provide: TranslationService,
          useValue: { translate: async () => 'Breakfast' },
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConditionTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a row when adding a condition', () => {
    fixture.detectChanges();

    const addButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    addButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(1);
  });

  it('adds and auto-translates the English field for only the selected condition', async () => {
    fixture.componentRef.setInput('conditions', [
      { condition: { fr: 'Petit-déjeuner' }, cout: 12 },
      { condition: { fr: 'Dîner' }, cout: 15 },
    ]);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'tr.mat-mdc-row button',
    ) as NodeListOf<HTMLButtonElement>;
    const translateButton = Array.from(buttons).find((button) =>
      button.textContent?.includes('Traduire en anglais'),
    );
    expect(translateButton).toBeTruthy();

    translateButton!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.conditions()).toEqual([
      { condition: { fr: 'Petit-déjeuner', en: 'Breakfast' }, cout: 12 },
      { condition: { fr: 'Dîner' }, cout: 15 },
    ]);
    expect(fixture.nativeElement.querySelectorAll('input[formcontrolname="en"]').length).toBe(1);
  });

  it('initializes the form from conditions and emits updated ConditionDto values', () => {
    const initialConditions: ConditionDto[] = [
      {
        condition: { fr: 'Petit-déjeuner', en: 'Breakfast' },
        cout: 12,
        par: Temporalite.Jour,
      },
    ];
    fixture.componentRef.setInput('conditions', initialConditions);
    fixture.detectChanges();

    expect(component.formArray.length).toBe(1);

    const row = component.formArray.at(0);
    row.controls.condition.controls.fr.setValue('Déjeuner');
    row.controls.cout.setValue(15);
    expect(component.conditions()).toEqual([
      {
        condition: { fr: 'Déjeuner', en: 'Breakfast' },
        cout: 15,
        par: Temporalite.Jour,
      },
    ]);

    component.add();
    expect(component.formArray.length).toBe(2);
    expect(component.conditions()[1]).toEqual({ condition: { fr: '' }, cout: 0 });

    component.remove(0);
    expect(component.formArray.length).toBe(1);
    expect(component.conditions()).toEqual([{ condition: { fr: '' }, cout: 0 }]);
  });
});
