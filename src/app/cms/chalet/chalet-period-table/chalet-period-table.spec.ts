import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChaletPeriodTable } from './chalet-period-table';
import { PeriodeDto } from '../../../openapi';

describe('ChaletPeriodTable', () => {
  let component: ChaletPeriodTable;
  let fixture: ComponentFixture<ChaletPeriodTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChaletPeriodTable]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChaletPeriodTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preserves date-only values when syncing datepicker dates with the DTO', async () => {
    const periods: PeriodeDto[] = [{
      dateDebut: '2025-01-02',
      dateFin: '2025-01-04',
      cout: 10,
    }];
    component.periodes.set(periods);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.formArray.at(0).controls.debut.value).toEqual(new Date(2025, 0, 2));
    component.formArray.at(0).controls.cout.setValue(12);

    expect(component.periodes()).toEqual([{...periods[0], cout: 12}]);
  });
});
