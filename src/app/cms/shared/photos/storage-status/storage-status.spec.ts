import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {PhotoService} from '../../../../openapi';
import {StorageStatus} from './storage-status';

describe('StorageStatus', () => {
  let component: StorageStatus;
  let fixture: ComponentFixture<StorageStatus>;
  const photoService = {
    photoControllerGetSpace: vi.fn(),
  };

  beforeEach(async () => {
    photoService.photoControllerGetSpace.mockClear();
    photoService.photoControllerGetSpace.mockReturnValue(of({left: 60, used: 40, total: 100}));
    await TestBed.configureTestingModule({
      imports: [StorageStatus],
      providers: [{provide: PhotoService, useValue: photoService}],
    }).compileComponents();

    fixture = TestBed.createComponent(StorageStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads storage usage and displays it in the progress bar', () => {
    expect(photoService.photoControllerGetSpace).toHaveBeenCalled();
    expect(component.usedPercentage()).toBe(40);
    expect(fixture.nativeElement.textContent).toContain('Espace utilisé : 40 %');
    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
  });

  it('reloads storage usage when its refresh key changes', () => {
    photoService.photoControllerGetSpace.mockReturnValue(of({left: 25, used: 75, total: 100}));

    fixture.componentRef.setInput('refreshKey', 1);
    fixture.detectChanges();

    expect(photoService.photoControllerGetSpace).toHaveBeenCalledTimes(2);
    expect(component.usedPercentage()).toBe(75);
  });

  it('displays an error when storage usage cannot be loaded', () => {
    photoService.photoControllerGetSpace.mockReturnValue(
      throwError(() => new Error('Request failed')),
    );

    fixture = TestBed.createComponent(StorageStatus);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Impossible de récupérer l’espace de stockage.',
    );
  });
});
