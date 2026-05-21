import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api';
import { ServerAnswer } from '../models/server-answer';
import { Street } from '../models/street';

@Component({
  selector: 'app-street-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './street-form.html',
  styleUrl: './street-form.css'
})
export class StreetForm {

  message = '';
  answer = '';
  streets: Street[] = [];
  
  id = new FormControl(1, Validators.required);
  name = new FormControl('', Validators.required);
  description = new FormControl('', Validators.required);
  length = new FormControl(0, Validators.required);
  lanes = new FormControl(0, Validators.required);
  category = new FormControl('', Validators.required);
  visitedAt = new FormControl('', Validators.required);
  geom = new FormControl('', Validators.required);

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

  constructor(private api: ApiService) {}

  getStreetFromForm() {
    let street = new Street();
    street.name = this.name.value || '';
    street.description = this.description.value || '';
    street.length = Number(this.length.value);
    street.lanes = Number(this.lanes.value);
    street.category = this.category.value || '';
    street.visitedAt = this.visitedAt.value || '';
    street.geom = this.geom.value || '';
    return street;
  }

  putStreetInForm(street: any) {
    this.id.setValue(street.id);
    this.name.setValue(street.name);
    this.description.setValue(street.description);
    this.length.setValue(street.length);
    this.lanes.setValue(street.lanes);
    this.category.setValue(street.category);
    this.visitedAt.setValue(street.visitedAt);
    this.geom.setValue(street.geom);
  }

  fillExample() {
    this.name.setValue('Blasco Ibanez Avenue');
    this.description.setValue('Street inserted from Angular reactive form');
    this.length.setValue(250.5);
    this.lanes.setValue(2);
    this.category.setValue('avenue');
    this.visitedAt.setValue('2026-05-07T10:00:00Z');
    this.geom.setValue('LINESTRING(726000 4372000, 726100 4372100)');
  }

  clean() {
    this.id.setValue(1);
    this.name.setValue('');
    this.description.setValue('');
    this.length.setValue(0);
    this.lanes.setValue(0);
    this.category.setValue('');
    this.visitedAt.setValue('');
    this.geom.setValue('');
    this.message = 'Street form cleaned';
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

    this.api.insert('street', this.getStreetFromForm()).subscribe((res: any) => {
      this.manageAnswer(res);
    });
  }

  selectAll() {
    this.api.selectAll('street').subscribe((res: any) => {
      let serverAnswer = res as ServerAnswer;
      this.answer = JSON.stringify(serverAnswer, null, 2);

      if (serverAnswer.ok) {
        this.message = serverAnswer.message;
        this.streets = serverAnswer.data as Street[];
      } else {
        this.message = 'Error: ' + serverAnswer.message;
      }
    });
  }

  selectOne() {
    let idValue = Number(this.id.value);

    this.api.selectOne('street', idValue).subscribe((res: any) => {
      this.manageAnswer(res);
      if (res.ok && res.data.length > 0) {
        this.putStreetInForm(res.data[0]);
      }
    });
  }

  update() {
    if (this.controlsGroup.invalid) {
      this.message = 'Error: some form controls are not valid';
      return;
    }

    let idValue = Number(this.id.value);

    this.api.update('street', idValue, this.getStreetFromForm()).subscribe((res: any) => {
      this.manageAnswer(res);
    });
  }

  delete() {
    let idValue = Number(this.id.value);

    this.api.delete('street', idValue).subscribe((res: any) => {
      this.manageAnswer(res);
      if (res.ok) {
        this.clean();
        this.message = 'Street deleted with id ' + idValue;
      }
    });
  }

  setDataInForm(street: any) {
    this.putStreetInForm(street);
    this.message = 'Street selected from table with id ' + street.id;
  }
}