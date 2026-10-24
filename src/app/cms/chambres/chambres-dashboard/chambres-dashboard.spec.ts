import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChambresDashboard } from './chambres-dashboard';

describe('ChambresDashboard', () => {
  let component: ChambresDashboard;
  let fixture: ComponentFixture<ChambresDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChambresDashboard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChambresDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
