import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {userSignal} from '../../../../main';
import {CreateUserDto, Role, UpdateUserDto, UserDto, UserService} from '../../../openapi';
import {UserForm} from '../user-form/user-form';
import {UsersList} from '../users-list/users-list';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-users-dashboard',
  imports: [UsersList, UserForm, MatToolbar],
  templateUrl: './users-dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users-dashboard.scss',
})
export class UsersDashboard implements OnInit {
  readonly user = userSignal;
  readonly users = signal<UserDto[]>([]);
  cursor: number | null = null;
  creatingUser = false;

  constructor(
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
  ) {}

  get selectedUser(): UserDto | undefined {
    return this.cursor === null ? this.user() : this.users()[this.cursor];
  }

  ngOnInit(): void {
    if (this.user()?.role !== Role.Admin) {
      return;
    }

    this.userService.userAdminControllerFindAll().subscribe({
      next: (users) => this.users.set(users.filter((user) => user.id !== this.user()?.id)),
      error: (error) => this.showError(error),
    });
  }

  select(index: number | null): void {
    this.cursor = index;
    this.creatingUser = false;
  }

  add(): void {
    this.cursor = -1;
    this.creatingUser = true;
  }

  save(dto: UpdateUserDto): void {
    if (this.creatingUser) {
      this.createUser(dto);
      return;
    }

    const selected = this.selectedUser;
    if (!selected) {
      return;
    }

    this.userService.userAdminControllerUpdate(selected.id, dto).subscribe({
      next: (updatedUser) => {
        if (this.cursor !== null) {
          this.users.update((users) =>
            users.map((user) => user.id === updatedUser.id ? updatedUser : user),
          );
        }
        if (updatedUser.id === this.user()?.id) {
          userSignal.set(updatedUser);
        }
        this.snackBar.open('Sauvegardé', 'Fermer', {duration: 5000});
      },
      error: (error) => this.showError(error),
    });
  }

  deleteSelected(): void {
    const selected = this.selectedUser;
    if (!selected || this.cursor === null) {
      return;
    }

    this.userService.userAdminControllerRemove(selected.id).subscribe({
      next: () => {
        this.users.update((users) => users.filter((user) => user.id !== selected.id));
        this.cursor = null;
        this.snackBar.open('Utilisateur supprimé', 'Fermer', {duration: 5000});
      },
      error: (error) => this.showError(error),
    });
  }

  protected readonly Role = Role;

  private createUser(dto: UpdateUserDto): void {
    if (!dto.password) {
      this.snackBar.open('Un mot de passe est requis pour créer un utilisateur', 'Fermer', {
        duration: 5000,
      });
      return;
    }

    const createDto: CreateUserDto = {
      email: dto.email ?? '',
      password: dto.password,
      firstName: dto.firstName ?? '',
      name: dto.name ?? '',
      role: dto.role,
    };

    this.userService.userAdminControllerCreate(createDto).subscribe({
      next: (createdUser) => {
        this.users.update((users) => [...users, createdUser]);
        this.cursor = this.users().length - 1;
        this.creatingUser = false;
        this.snackBar.open('Utilisateur créé', 'Fermer', {duration: 5000});
      },
      error: (error) => this.showError(error),
    });
  }

  private showError(error: {error?: {message?: string}}): void {
    this.snackBar.open(
      `Échec : ${error.error?.message ?? 'Une erreur est survenue'}`,
      'Fermer',
      {duration: 10000, panelClass: ['red-snackbar']},
    );
  }
}
