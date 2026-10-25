import {Component, inject} from '@angular/core';
import {LitDto, LitService} from '../../../../openapi';

@Component({
  imports: [],
  selector: 'app-lit-store',
  styleUrl: './lit-store.scss',
  templateUrl: './lit-store.html',
})
export class LitStore {
  private readonly litService = inject(LitService);

  lits: LitDto[] = [];

  ngOnInit() {
    this.litService.litControllerFindAll().subscribe((dto) => this.lits = dto);
  }
}
