import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatRipple} from '@angular/material/core';
import {MatDivider, MatList, MatListItem, MatListItemIcon} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {Role, UserDto} from '../../../openapi';

@Component({
  selector: 'app-users-list',
  imports: [MatIcon, MatList, MatListItem, MatDivider, MatRipple, MatListItemIcon],
  templateUrl: './users-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users-list.scss',
})
export class UsersList {
  readonly me = input.required<UserDto>();
  readonly users = input.required<UserDto[]>();
  readonly cursor = input<number | null>(null);
  readonly cursorChange = output<number | null>();
  readonly add = output<void>();

  select(index: number | null): void {
    this.cursorChange.emit(index);
  }

  selected(index: number | null): boolean {
    return index === this.cursor();
  }

  protected readonly Role = Role;
}
