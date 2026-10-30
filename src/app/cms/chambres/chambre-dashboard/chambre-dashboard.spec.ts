import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChambreDashboard } from './chambre-dashboard';

describe('ChaletDashboard', () => {
  let component: ChambreDashboard;
  let fixture: ComponentFixture<ChambreDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChambreDashboard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChambreDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
