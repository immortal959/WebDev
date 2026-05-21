import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api';
import { ServerAnswer } from '../models/server-answer';
import { Building } from '../models/building';

@Component({
  selector: 'app-building-form',
  imports: [ReactiveFormsModule],
  templateUrl: './building-form.html',
  styleUrl: './building-form.css'
})
export class BuildingForm {

  message = '';
  answer = '';
  buildings: Building[] = [];
  
  id = new FormControl(1, Validators.required);
  name = new FormControl('', Validators.required);
  description = new FormControl('', Validators.required);
  floors = new FormControl(0, Validators.required);
  height = new FormControl(0, Validators.required);
  category = new FormControl('', Validators.required);
  visitedAt = new FormControl('', Validators.required);
  geom = new FormControl('', Validators.required);

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

  constructor(private api: ApiService) {}

  getBuildingFromForm() {
    let building = new Building();
    building.name = this.name.value || '';
    building.description = this.description.value || '';
    building.floors = Number(this.floors.value);
    building.height = Number(this.height.value);
    building.category = this.category.value || '';
    building.visitedAt = this.visitedAt.value || '';
    building.geom = this.geom.value || '';
    return building;
  }

  putBuildingInForm(building: any) {
    this.id.setValue(building.id);
    this.name.setValue(building.name);
    this.description.setValue(building.description);
    this.floors.setValue(building.floors);
    this.height.setValue(building.height);
    this.category.setValue(building.category);
    this.visitedAt.setValue(building.visitedAt);
    this.geom.setValue(building.geom);
  }

  fillExample() {
    this.name.setValue('UPV Building');
    this.description.setValue('Building inserted from Angular reactive form');
    this.floors.setValue(4);
    this.height.setValue(18.5);
    this.category.setValue('university');
    this.visitedAt.setValue('2026-05-07T10:00:00Z');
    this.geom.setValue('POLYGON((726000 4372000, 726100 4372000, 726100 4372100, 726000 4372100, 726000 4372000))');
  }

  clean() {
    this.id.setValue(1);
    this.name.setValue('');
    this.description.setValue('');
    this.floors.setValue(0);
    this.height.setValue(0);
    this.category.setValue('');
    this.visitedAt.setValue('');
    this.geom.setValue('');
    this.message = 'Building form cleaned';
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

    this.api.insert('building', this.getBuildingFromForm()).subscribe((res: any) => {
      this.manageAnswer(res);
    });
  }

  selectAll() {
    this.api.selectAll('building').subscribe((res: any) => {
      let serverAnswer = res as ServerAnswer;
      this.answer = JSON.stringify(serverAnswer, null, 2);

      if (serverAnswer.ok) {
        this.message = serverAnswer.message;
        this.buildings = serverAnswer.data as Building[];
      } else {
        this.message = 'Error: ' + serverAnswer.message;
      }
    });
  }
  
  setDataInForm(building: any) {
    this.putBuildingInForm(building);
    this.message = 'Building selected from table with id ' + building.id;
  }

  selectOne() {
    let idValue = Number(this.id.value);

    this.api.selectOne('building', idValue).subscribe((res: any) => {
      this.manageAnswer(res);
      if (res.ok && res.data.length > 0) {
        this.putBuildingInForm(res.data[0]);
      }
    });
  }

  update() {
    if (this.controlsGroup.invalid) {
      this.message = 'Error: some form controls are not valid';
      return;
    }

    let idValue = Number(this.id.value);

    this.api.update('building', idValue, this.getBuildingFromForm()).subscribe((res: any) => {
      this.manageAnswer(res);
    });
  }

  delete() {
    let idValue = Number(this.id.value);

    this.api.delete('building', idValue).subscribe((res: any) => {
      this.manageAnswer(res);
      if (res.ok) {
        this.clean();
        this.message = 'Building deleted with id ' + idValue;
      }
    });
  }
}