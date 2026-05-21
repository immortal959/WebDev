import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api';
import { ServerAnswer } from '../models/server-answer';
import { Point } from '../models/point';

@Component({
  selector: 'app-point-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './point-form.html',
  styleUrl: './point-form.css'
})
export class PointForm {

  message = '';
  answer = '';
  pois: Point[] = [];

  id = new FormControl(1, Validators.required);
  name = new FormControl('', Validators.required);
  description = new FormControl('', Validators.required);
  category = new FormControl('', Validators.required);
  visitedAt = new FormControl('', Validators.required);
  rating = new FormControl(0, Validators.required);
  geom = new FormControl('', Validators.required);

  controlsGroup = new FormGroup({
    id: this.id,
    name: this.name,
    description: this.description,
    category: this.category,
    visitedAt: this.visitedAt,
    rating: this.rating,
    geom: this.geom
  });

  constructor(private api: ApiService) {}

  getPointFromForm() {
    let point = new Point();
    point.name = this.name.value || '';
    point.description = this.description.value || '';
    point.category = this.category.value || '';
    point.visitedAt = this.visitedAt.value || '';
    point.rating = Number(this.rating.value);
    point.geom = this.geom.value || '';
    return point;
  }

  putPointInForm(point: any) {
    this.id.setValue(point.id);
    this.name.setValue(point.name);
    this.description.setValue(point.description);
    this.category.setValue(point.category);
    this.visitedAt.setValue(point.visitedAt);
    this.rating.setValue(point.rating);
    this.geom.setValue(point.geom);
  }

  fillExample() {
    this.name.setValue('UPV Point');
    this.description.setValue('Point inserted from Angular reactive form');
    this.category.setValue('landmark');
    this.visitedAt.setValue('2026-05-07T10:00:00Z');
    this.rating.setValue(5);
    this.geom.setValue('POINT(726050 4372050)');
  }

  clean() {
    this.id.setValue(1);
    this.name.setValue('');
    this.description.setValue('');
    this.category.setValue('');
    this.visitedAt.setValue('');
    this.rating.setValue(0);
    this.geom.setValue('');
    this.message = 'Point form cleaned';
    this.answer = '';
  }

  manageAnswer(res: any) {
    let serverAnswer = res as ServerAnswer;
    this.answer = JSON.stringify(serverAnswer, null, 2);

    if (serverAnswer.ok) {
      this.message = serverAnswer.message;
      if (serverAnswer.data.length > 0 && serverAnswer.data[0].id) {
        this.id.setValue(serverAnswer.data[0].id);
        this.message = serverAnswer.message + ' with id ' + serverAnswer.data[0].id;
      }
    } else {
      this.message = 'Error: ' + serverAnswer.message;
    }
  }

  insert() {
    if (this.controlsGroup.invalid) {
      this.message = 'Error: some form controls are not valid';
      return;
    }

    this.api.insert('point', this.getPointFromForm()).subscribe((res: any) => {
      this.manageAnswer(res);
    });
  }

  selectAll() {
    this.api.selectAll('point').subscribe((res: any) => {
      let serverAnswer = res as ServerAnswer;
      this.answer = JSON.stringify(serverAnswer, null, 2);

      if (serverAnswer.ok) {
        this.message = serverAnswer.message;
        this.pois = serverAnswer.data as Point[];
      } else {
        this.message = 'Error: ' + serverAnswer.message;
      }
    });
  }

  selectOne() {
    let idValue = Number(this.id.value);

    this.api.selectOne('point', idValue).subscribe((res: any) => {
      this.manageAnswer(res);
      if (res.ok && res.data.length > 0) {
        this.putPointInForm(res.data[0]);
      }
    });
  }

  update() {
    if (this.controlsGroup.invalid) {
      this.message = 'Error: some form controls are not valid';
      return;
    }

    let idValue = Number(this.id.value);

    this.api.update('point', idValue, this.getPointFromForm()).subscribe((res: any) => {
      this.manageAnswer(res);
    });
  }

  delete() {
    let idValue = Number(this.id.value);

    this.api.delete('point', idValue).subscribe((res: any) => {
      this.manageAnswer(res);
      if (res.ok) {
        this.clean();
        this.message = 'Point deleted with id ' + idValue;
      }
    });
  }

  setDataInForm(point: any) {
    this.putPointInForm(point);
    this.message = 'Point selected from table with id ' + point.id;
  }
}