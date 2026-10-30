import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LitStore } from './lit-store';

describe('LitStore', () => {
  let component: LitStore;
  let fixture: ComponentFixture<LitStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LitStore]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LitStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
