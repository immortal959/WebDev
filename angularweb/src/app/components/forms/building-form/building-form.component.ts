import { Component, OnInit } from '@angular/core';

//To use the template syntax @if, @for, ...
import { CommonModule } from '@angular/common';

//To use forms
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from "@angular/material/input";
import { MatTooltip } from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';

import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';

import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { BuildingModel } from '../../../models/building.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule],
  templateUrl: './building-form.component.html',
  styleUrl: './building-form.component.scss'
})
export class BuildingFormComponent implements OnInit{
  geomInUrl = false;
  l: BuildingModel[]=[];
  serverMessage = '';

  id = new FormControl('');
  description = new FormControl('', [Validators.required]);
  area = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

  controlsGroup = new FormGroup({
    id: this.id,
    description: this.description,
    area: this.area,
    geom: this.geom
  })

  constructor(private apiService:ApiService, private activatedRoute: ActivatedRoute,
    public router: Router
  ){}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      var geom = params.get("geom");
      if (geom){
        this.geom.setValue(geom);
        this.geomInUrl=true;
      }
    });
  }

  insert(){
    this.serverMessage='';
    console.log(this.controlsGroup.valid)
    console.log(this.controlsGroup.value)
    this.apiService.post('webcrud/building/insert/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        this.serverMessage=response.message;
        this.selectAll();
      },
      error:error=>{
        console.log(error.description)
      }
    })
  }

  select(){
    this.serverMessage='';
    if (!this.id.value){
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.get('webcrud/building/selectone/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        if (response.ok){
          var d: BuildingModel = response.data[0] as BuildingModel;
          this.setDataInForm(d);
          this.clearList();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })
  }

  selectAll(){
    this.serverMessage='';
    this.apiService.get('webcrud/building/selectall/').subscribe({
      next: response => {
        console.log('response',response)
        this.l = response.data as BuildingModel[];
        this.serverMessage=response.message;
      },
      error:error=>{
        console.log(error.description)
      }
    })
  }

  deleteRow(){
    this.serverMessage='';
    if (!this.id.value){
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.post('webcrud/building/delete/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        if (response.ok){
          this.clearForm();
          this.selectAll();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })
  }

  update(){
    this.serverMessage='';
    if (!this.id.value){
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.post('webcrud/building/update/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        if (response.ok){
          this.selectAll();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })
  }

  clearForm(){
    this.controlsGroup.reset();
  }

  clearList(){
    this.l = [];
  }

  setDataInForm(data: BuildingModel){
    this.id.setValue(data.id.toString());
    this.description.setValue(data.description);
    this.area.setValue(data.area.toString());
    this.geom.setValue(data.geom);
  }

  useGeomInUrl(){
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.geom.setValue(params.get("geom"));
    });
  }
}
