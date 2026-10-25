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
});
