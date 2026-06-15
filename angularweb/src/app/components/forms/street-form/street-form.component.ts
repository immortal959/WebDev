import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from "@angular/material/input";
import { MatTooltip } from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-street-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule],
  templateUrl: './street-form.component.html',
  styleUrl: './street-form.component.scss'
})
export class StreetFormComponent implements OnInit {
  geomInUrl = false;
  l: any[] = [];
  serverMessage = '';

  id = new FormControl('');
  name = new FormControl('', [Validators.required]);
  description = new FormControl('', [Validators.required]);
  length = new FormControl('', [Validators.required]);
  lanes = new FormControl('', [Validators.required]);
  category = new FormControl('', [Validators.required]);
  visitedAt = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

  controlsGroup = new FormGroup({
    id: this.id,
    name: this.name,
    description: this.description,
    length: this.length,
    lanes: this.lanes,
    category: this.category,
    visitedAt: this.visitedAt,
    geom: this.geom
  });

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute,
    public router: Router) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get("geom");
      if (geom) { this.geom.setValue(geom); this.geomInUrl = true; }
    });
  }

  insert() {
    this.serverMessage = '';
    this.apiService.post('webcrud/street/insert/', this.controlsGroup.value).subscribe({
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
    this.apiService.get('webcrud/street/selectone/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok && response.data.length > 0) {
          const d = response.data[0];
          this.id.setValue(d['id']); this.name.setValue(d['name']);
          this.description.setValue(d['description']); this.length.setValue(d['length']);
          this.lanes.setValue(d['lanes']); this.category.setValue(d['category']);
          this.visitedAt.setValue(d['visitedAt']); this.geom.setValue(d['geom']);
          this.clearList();
        }
        this.serverMessage = response.message;
      },
      error: error => { console.log(error); }
    });
  }

  selectAll() {
    this.serverMessage = '';
    this.apiService.get('webcrud/street/selectall/').subscribe({
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
    this.apiService.post('webcrud/street/delete/' + this.id.value + '/').subscribe({
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
    this.apiService.post('webcrud/street/update/' + this.id.value + '/', this.controlsGroup.value).subscribe({
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