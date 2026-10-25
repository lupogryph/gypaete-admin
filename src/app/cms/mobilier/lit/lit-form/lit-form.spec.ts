import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LitForm } from './lit-form';

describe('LitForm', () => {
  let component: LitForm;
  let fixture: ComponentFixture<LitForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LitForm]
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
