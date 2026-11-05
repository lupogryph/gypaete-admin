import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {InfoDto, InfosService, UpdateInfoDto} from '../../../openapi';
import {Snackbar} from '../../../core/snackbar/snackbar';
import {InfosDashboard} from './infos-dashboard';

describe('InfosDashboard', () => {
  let fixture: ComponentFixture<InfosDashboard>;
  let component: InfosDashboard;
  let infosService: {
    infosControllerFindAll: ReturnType<typeof vi.fn>;
    infosControllerUpdate: ReturnType<typeof vi.fn>;
  };
  const info: InfoDto = {
    id: 12,
    postal: '12 rue des Alpes',
    phoneNumbers: ['+33123456789'],
    email: 'contact@example.com',
    socialNetworks: {instagram: 'https://instagram.com/example'},
  };

  beforeEach(async () => {
    infosService = {
      infosControllerFindAll: vi.fn(() => of([info])),
      infosControllerUpdate: vi.fn((_id: number, _update: UpdateInfoDto) => of(info)),
    };

    await TestBed.configureTestingModule({
      imports: [InfosDashboard],
      providers: [
        {provide: InfosService, useValue: infosService},
        {provide: Snackbar, useValue: {error: vi.fn(), success: vi.fn()}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfosDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the info record and validates added phone numbers', () => {
    expect(component.info()?.id).toBe(info.id);
    expect(component.phoneNumbers.length).toBe(1);

    component.addPhoneNumber();
    expect(component.phoneNumbers.at(1).valid).toBe(false);
    component.phoneNumbers.at(1).setValue('   ');
    expect(component.phoneNumbers.at(1).valid).toBe(false);
    component.phoneNumbers.at(1).setValue('+33 6 12 34 56 78');
    expect(component.phoneNumbers.at(1).valid).toBe(true);
  });

  it('detects a social network from its URL', () => {
    component.addSocialNetwork();
    component.form.controls.socialNetworks.controls['socialNetwork1'].setValue('https://www.youtube.com/@gypaete');

    component.detectSocialNetwork('socialNetwork1');

    expect(component.form.controls.socialNetworks.controls['youtube'].value)
      .toBe('https://www.youtube.com/@gypaete');
    expect(component.form.controls.socialNetworks.controls['socialNetwork1']).toBeUndefined();
  });

  it('PATCHes the current record with form values', () => {
    component.form.controls.email.setValue('hello@example.com');

    component.save();

    expect(infosService.infosControllerUpdate).toHaveBeenCalledWith(12, expect.objectContaining({
      email: 'hello@example.com',
      postal: '12 rue des Alpes',
      phoneNumbers: ['+33123456789'],
    }));
  });
});
