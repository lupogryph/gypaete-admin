import {Component, input} from '@angular/core';
import {LitChambreDto} from '../../../../openapi';

@Component({
  imports: [
  ],
  selector: 'app-lit-table',
  styleUrl: './lit-table.scss',
  templateUrl: './lit-table.html',
})
export class LitTable {
  readonly lits = input<LitChambreDto[]>([]);
}
