import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DescriptionForm } from './description-form';

describe('DescriptionForm', () => {
  let component: DescriptionForm;
  let fixture: ComponentFixture<DescriptionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DescriptionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
