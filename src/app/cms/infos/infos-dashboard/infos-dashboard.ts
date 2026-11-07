import {Component, inject, signal} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormRecord,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatError, MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatList, MatListItem, MatListItemIcon} from '@angular/material/list';
import {MatRipple} from '@angular/material/core';
import {MatToolbar} from '@angular/material/toolbar';
import {InfoDto, InfosService, UpdateInfoDto} from '../../../openapi';
import {Snackbar} from '../../../core/snackbar/snackbar';

type InfoForm = FormGroup<{
  postal: FormControl<string>;
  phoneNumbers: FormArray<FormControl<string>>;
  email: FormControl<string>;
  socialNetworks: FormRecord<FormControl<string>>;
  reservationLinks: FormArray<FormControl<string>>;
}>;

const phoneNumberValidator: ValidatorFn = (control): ValidationErrors | null => {
  const rawPhone = String(control.value ?? '');
  const phone = rawPhone.trim();
  if (!phone) {
    return rawPhone ? {phoneNumber: true} : null;
  }

  const digits = phone.replace(/\D/g, '');
  return /^\+?[\d\s().-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15
    ? null
    : {phoneNumber: true};
};

const socialNetworkHosts: Record<string, string[]> = {
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  linkedin: ['linkedin.com'],
  pinterest: ['pinterest.com'],
  tiktok: ['tiktok.com'],
  twitter: ['twitter.com', 'x.com'],
  whatsapp: ['whatsapp.com', 'wa.me'],
  youtube: ['youtube.com', 'youtu.be'],
};

@Component({
  selector: 'app-infos-dashboard',
  imports: [
    MatButton,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatList,
    MatListItem,
    MatListItemIcon,
    MatRipple,
    MatToolbar,
    ReactiveFormsModule,
    MatPrefix,
  ],
  templateUrl: './infos-dashboard.html',
  styleUrl: './infos-dashboard.scss',
})
export class InfosDashboard {
  private readonly infosService = inject(InfosService);
  private readonly snackBar = inject(Snackbar);

  readonly info = signal<InfoDto | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly sections = [
    {id: 'contact', label: 'Coordonnées', icon: 'contact_mail'},
    {id: 'social', label: 'Réseaux sociaux', icon: 'share'},
    {id: 'reservations', label: 'Liens de réservation', icon: 'link'},
  ] as const;
  activeSection: (typeof this.sections)[number]['id'] = 'contact';

  readonly form: InfoForm = new FormGroup({
    postal: new FormControl('', {nonNullable: true}),
    phoneNumbers: new FormArray<FormControl<string>>([]),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    socialNetworks: new FormRecord<FormControl<string>>({}),
    reservationLinks: new FormArray<FormControl<string>>([]),
  });

  get phoneNumbers(): FormArray<FormControl<string>> {
    return this.form.controls.phoneNumbers;
  }

  get socialNetworkEntries(): [string, FormControl<string>][] {
    return Object.entries(this.form.controls.socialNetworks.controls);
  }

  get reservationLinks(): FormArray<FormControl<string>> {
    return this.form.controls.reservationLinks;
  }

  ngOnInit(): void {
    this.infosService.infosControllerFind().subscribe({
      next: (info) => {
        if (!info) {
          this.snackBar.error('Aucune information de contact n’a été trouvée.');
          this.loading.set(false);
          return;
        }

        this.setInfo(info);
      },
      error: (error: {error?: {message?: string | string[]}}) => {
        this.loading.set(false);
        this.snackBar.error(error.error?.message);
      },
    });
  }

  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneControl());
  }

  removePhoneNumber(index: number): void {
    this.phoneNumbers.removeAt(index);
  }

  addSocialNetwork(): void {
    const controls = this.form.controls.socialNetworks.controls;
    let index = 1;
    while (controls[`socialNetwork${index}`]) {
      index++;
    }
    this.form.controls.socialNetworks.addControl(
      `socialNetwork${index}`,
      new FormControl('', {nonNullable: true}),
    );
  }

  removeSocialNetwork(name: string): void {
    this.form.controls.socialNetworks.removeControl(name);
  }

  addReservationLink(): void {
    this.reservationLinks.push(new FormControl('', {nonNullable: true}));
  }

  removeReservationLink(index: number): void {
    this.reservationLinks.removeAt(index);
  }

  detectSocialNetwork(name: string): void {
    const url = this.form.controls.socialNetworks.controls[name]?.value.trim();
    if (!url) {
      return;
    }

    const host = this.parseHost(url);
    if (!host) {
      return;
    }

    const detectedName = Object.entries(socialNetworkHosts).find(([, hosts]) =>
      hosts.some((knownHost) => host === knownHost || host.endsWith(`.${knownHost}`)),
    )?.[0];
    if (!detectedName || detectedName === name) {
      return;
    }

    const controls = this.form.controls.socialNetworks;
    if (controls.controls[detectedName]) {
      return;
    }

    const control = controls.controls[name];
    if (!control) {
      return;
    }

    controls.removeControl(name, {emitEvent: false});
    controls.addControl(detectedName, control);
  }

  socialNetworkLabel(name: string): string {
    const labels: Record<string, string> = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      pinterest: 'Pinterest',
      tiktok: 'TikTok',
      twitter: 'X / Twitter',
      whatsapp: 'WhatsApp',
      youtube: 'YouTube',
    };

    return labels[name] ??
      name.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
  }

  save(): void {
    const info = this.info();
    if (!info || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const update: UpdateInfoDto = {
      postal: value.postal,
      phoneNumbers: value.phoneNumbers.map((phone) => phone.trim()),
      email: value.email.trim(),
      socialNetworks: Object.fromEntries(
        Object.entries(value.socialNetworks)
          .map(([name, url]) => [name, url.trim()])
          .filter(([, url]) => url),
      ),
      reservationLinks: value.reservationLinks.map((url) => url.trim()).filter(Boolean),
    };

    this.saving.set(true);
    this.infosService.infosControllerUpdate(update).subscribe({
      next: (updatedInfo) => {
        this.setInfo(updatedInfo);
        this.snackBar.success('Sauvegardé');
      },
      error: (error: {error?: {message?: string | string[]}}) => {
        this.saving.set(false);
        this.snackBar.error(error.error?.message);
      },
      complete: () => this.saving.set(false),
    });
  }

  private setInfo(info: InfoDto): void {
    this.info.set(info);
    this.form.controls.postal.setValue(info.postal);
    this.form.controls.email.setValue(info.email);

    this.phoneNumbers.clear({emitEvent: false});
    for (const phone of info.phoneNumbers) {
      this.phoneNumbers.push(this.createPhoneControl(phone), {emitEvent: false});
    }

    const socialNetworks = this.form.controls.socialNetworks;
    for (const name of Object.keys(socialNetworks.controls)) {
      socialNetworks.removeControl(name, {emitEvent: false});
    }
    for (const [name, url] of Object.entries(info.socialNetworks)) {
      socialNetworks.addControl(name, new FormControl(url, {nonNullable: true}), {emitEvent: false});
    }

    this.reservationLinks.clear({emitEvent: false});
    for (const url of info.reservationLinks) {
      this.reservationLinks.push(new FormControl(url, {nonNullable: true}), {emitEvent: false});
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.loading.set(false);
  }

  private createPhoneControl(value = ''): FormControl<string> {
    return new FormControl(value, {
      nonNullable: true,
      validators: [Validators.required, phoneNumberValidator],
    });
  }

  private parseHost(value: string): string | null {
    try {
      const candidate = value.includes('://') ? value : `https://${value}`;
      const parsed = new URL(candidate);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      return parsed.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return null;
    }
  }
}
