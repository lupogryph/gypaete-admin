import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LitTable } from './lit-table';

describe('LitTable', () => {
  let component: LitTable;
  let fixture: ComponentFixture<LitTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LitTable]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LitTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('excludes lits selected in other rows while keeping the current row selection', () => {
    const lits = [
      {id: 1, classe: 'Simple', largeur: 90},
      {id: 2, classe: 'Double', largeur: 140},
    ];
    component.availableLits.set(lits);
    component.add();
    component.add();
    const [firstRow, secondRow] = component.formArray.controls;

    component.selectLit(firstRow, 1);
    component.selectLit(secondRow, 2);

    expect(component.availableLitsFor(firstRow)).toEqual([lits[0]]);
    expect(component.availableLitsFor(secondRow)).toEqual([lits[1]]);
  });

  it('initializes each added row with the first lit not already selected', () => {
    const lits = [
      {id: 1, classe: 'Simple', largeur: 90},
      {id: 2, classe: 'Double', largeur: 140},
    ];
    component.availableLits.set(lits);

    component.add();
    component.add();

    expect(component.formArray.controls.map((row) => row.controls.litId.value)).toEqual([1, 2]);
  });
});
