import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {userSignal} from '../../../../main';
import {CreateUserDto, Role, UpdateUserDto, UserDto, UserService} from '../../../openapi';
import {UserForm} from '../user-form/user-form';
import {UsersList} from '../users-list/users-list';
import {MatToolbar} from '@angular/material/toolbar';
import {Snackbar} from '../../../core/snackbar/snackbar';

@Component({
  selector: 'app-users-dashboard',
  imports: [UsersList, UserForm, MatToolbar],
  templateUrl: './users-dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users-dashboard.scss',
})
export class UsersDashboard implements OnInit {
  readonly userService = inject(UserService);
  readonly snackBar = inject(Snackbar);

  readonly user = userSignal;
  readonly users = signal<UserDto[]>([]);
  cursor: number | null = null;
  creatingUser = false;

  get selectedUser(): UserDto | undefined {
    return this.cursor === null ? this.user() : this.users()[this.cursor];
  }

  ngOnInit(): void {
    if (this.user()?.role !== Role.Admin) {
      return;
    }

    this.userService.userAdminControllerFindAll().subscribe({
      next: (users) => this.users.set(users.filter((user) => user.id !== this.user()?.id)),
      error: (error) => this.snackBar.error(error),
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
        this.snackBar.success('Sauvegardé');
      },
      error: (error) => this.snackBar.error(error),
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
        this.snackBar.success('Utilisateur supprimé');
      },
      error: (error) => this.snackBar.error(error),
    });
  }

  protected readonly Role = Role;

  private createUser(dto: UpdateUserDto): void {
    if (!dto.password) {
      this.snackBar.error('Un mot de passe est requis pour créer un utilisateur');
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
        this.snackBar.success('Utilisateur créé');
      },
      error: (error) => this.snackBar.error(error),
    });
  }
}
