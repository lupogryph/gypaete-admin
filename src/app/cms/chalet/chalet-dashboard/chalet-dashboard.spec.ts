import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChaletDashboard } from './chalet-dashboard';

describe('ChaletDashboard', () => {
  let component: ChaletDashboard;
  let fixture: ComponentFixture<ChaletDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChaletDashboard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChaletDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
