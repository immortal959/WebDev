import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatTooltip } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule, MatAutocompleteModule],
  templateUrl: './building-form.component.html',
  styleUrl: './building-form.component.scss'
})
export class BuildingFormComponent implements OnInit {
  geomInUrl = false;
  l: any[] = [];
  serverMessage = '';
  categories: any[] = [];
  filteredCategories!: Observable<any[]>;

  id = new FormControl('');
  name = new FormControl('', [Validators.required]);
  description = new FormControl('', [Validators.required]);
  floors = new FormControl('', [Validators.required]);
  height = new FormControl('', [Validators.required]);
  category = new FormControl('', [Validators.required]);
  visitedAt = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

  controlsGroup = new FormGroup({
    id: this.id,
    name: this.name,
    description: this.description,
    floors: this.floors,
    height: this.height,
    category: this.category,
    visitedAt: this.visitedAt,
    geom: this.geom
  });

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute,
    public router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get("geom");
      const id = params.get("id");
      if (geom) {
        this.geom.setValue(geom);
        this.geomInUrl = true;
      }
      if (id) {
        this.id.setValue(id);
        setTimeout(() => {
          this.apiService.get('webcrud/building/selectone/' + id + '/').subscribe({
            next: (response: ServerAnswerModel) => {
              if (response.ok && response.data.length > 0) {
                const d = response.data[0];
                this.name.setValue(d['name']);
                this.description.setValue(d['description']);
                this.floors.setValue(d['floors']);
                this.height.setValue(d['height']);
                const cat = this.categories.find((c: any) => c.id === d['category']);
                this.category.setValue(cat ? cat.name : '');
                this.visitedAt.setValue(d['visitedAt']);
                if (geom) {
                  this.geom.setValue(geom);
                } else {
                  this.geom.setValue(d['geom']);
                }
              }
            },
            error: error => { console.log(error); }
          });
        }, 500);
      }
    });
  }
  
  loadCategories(): void {
    this.apiService.get('codelist/building-category/').subscribe({
      next: (response: ServerAnswerModel) => {
        this.categories = response.data;
        this.filteredCategories = this.category.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || ''))
        );
      },
      error: error => { console.log(error); }
    });
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.categories.filter(cat => cat.name.toLowerCase().includes(filterValue));
  }

  getCategoryId(): number | null {
    const cat = this.categories.find(c => c.name === this.category.value);
    return cat ? cat.id : null;
  }

  insert() {
    this.serverMessage = '';
    const data = {
      ...this.controlsGroup.value,
      category: this.getCategoryId()
    };
    this.apiService.post('webcrud/building/insert/', data).subscribe({
      next: (response: ServerAnswerModel) => {
        this.serverMessage = response.message;
        if (response.ok) { this.selectAll(); }
      },
      error: error => { console.log(error); }
    });
  }

  select() {
    this.serverMessage = '';
    if (!this.id.value) { this.serverMessage = 'Put an id'; return; }
    this.apiService.get('webcrud/building/selectone/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok && response.data.length > 0) {
          const d = response.data[0];
          this.id.setValue(d['id']);
          this.name.setValue(d['name']);
          this.description.setValue(d['description']);
          this.floors.setValue(d['floors']);
          this.height.setValue(d['height']);
          const cat = this.categories.find(c => c.id === d['category']);
          this.category.setValue(cat ? cat.name : '');
          this.visitedAt.setValue(d['visitedAt']);
          this.geom.setValue(d['geom']);
          this.clearList();
        }
        this.serverMessage = response.message;
      },
      error: error => { console.log(error); }
    });
  }

  selectAll() {
    this.serverMessage = '';
    this.apiService.get('webcrud/building/selectall/').subscribe({
      next: (response: ServerAnswerModel) => {
        this.l = response.data;
        this.serverMessage = response.message;
      },
      error: error => { console.log(error); }
    });
  }

  deleteRow() {
    this.serverMessage = '';
    if (!this.id.value) { this.serverMessage = 'Put an id'; return; }
    this.apiService.post('webcrud/building/delete/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) { this.clearForm(); this.selectAll(); }
        this.serverMessage = response.message;
      },
      error: error => { console.log(error); }
    });
  }

  update() {
    this.serverMessage = '';
    if (!this.id.value) { this.serverMessage = 'Put an id'; return; }
    const data = {
      ...this.controlsGroup.value,
      category: this.getCategoryId()
    };
    this.apiService.post('webcrud/building/update/' + this.id.value + '/', data).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) { this.selectAll(); }
        this.serverMessage = response.message;
      },
      error: error => { console.log(error); }
    });
  }

  clearForm() { this.controlsGroup.reset(); }
  clearList() { this.l = []; }
  useGeomInUrl() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.geom.setValue(params.get("geom"));
    });
  }
}