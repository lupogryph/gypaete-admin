import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslationService} from '../../core/translation/translation.service';
import {FrenTable} from './fren-table';

describe('FrenTable', () => {
  let component: FrenTable;
  let fixture: ComponentFixture<FrenTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrenTable],
      providers: [
        {
          provide: TranslationService,
          useValue: {translate: async () => 'Breakfast'},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FrenTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds, edits and removes French-English entries', () => {
    fixture.componentRef.setInput('frens', [{fr: 'Petit-déjeuner'}]);
    fixture.detectChanges();

    expect(component.frensArray.length).toBe(1);

    const row = component.frensArray.at(0);
    row.controls.en.setValue('Breakfast');
    expect(component.frens()).toEqual([{fr: 'Petit-déjeuner', en: 'Breakfast'}]);

    component.add();
    expect(component.frensArray.length).toBe(2);
    expect(component.frens()[1]).toEqual({fr: ''});

    component.remove(0);
    expect(component.frensArray.length).toBe(1);
    expect(component.frens()).toEqual([{fr: ''}]);
  });

  it('translates the selected French entry into English', async () => {
    fixture.componentRef.setInput('frens', [{fr: 'Petit-déjeuner'}]);
    fixture.detectChanges();

    await component.addEn(component.frensArray.at(0));

    expect(component.frens()).toEqual([{fr: 'Petit-déjeuner', en: 'Breakfast'}]);
  });
});
