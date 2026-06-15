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
import { PointModel } from '../../../models/point.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-point-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule],
  templateUrl: './point-form.component.html',
  styleUrl: './point-form.component.scss'
})
export class PointFormComponent implements OnInit{
  geomInUrl = false;
  l: PointModel[]=[];
  serverMessage = '';

  id = new FormControl('');
  name = new FormControl('', [Validators.required]);
  description = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(5)]);

  controlsGroup = new FormGroup({
    id: this.id,
    name: this.name,
    description: this.description,
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
    this.apiService.post('webcrud/point/insert/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        this.serverMessage=response.message;
        this.selectAll();
      },
      error:error=>{ console.log(error.description) }
    })
  }

  select(){
    this.serverMessage='';
    if (!this.id.value){ this.serverMessage='Put an id'; return; }
    this.apiService.get('webcrud/point/selectone/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok){
          var d: PointModel = response.data[0] as PointModel;
          this.setDataInForm(d);
          this.clearList();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{ console.log(error.description) }
    })
  }

  selectAll(){
    this.serverMessage='';
    this.apiService.get('webcrud/point/selectall/').subscribe({
      next: response => {
        this.l = response.data as PointModel[];
        this.serverMessage=response.message;
      },
      error:error=>{ console.log(error.description) }
    })
  }

  deleteRow(){
    this.serverMessage='';
    if (!this.id.value){ this.serverMessage='Put an id'; return; }
    this.apiService.post('webcrud/point/delete/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok){ this.clearForm(); this.selectAll(); }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{ console.log(error.description) }
    })
  }

  update(){
    this.serverMessage='';
    if (!this.id.value){ this.serverMessage='Put an id'; return; }
    this.apiService.post('webcrud/point/update/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok){ this.selectAll(); }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{ console.log(error.description) }
    })
  }

  clearForm(){ this.controlsGroup.reset(); }
  clearList(){ this.l = []; }

  setDataInForm(data: PointModel){
    this.id.setValue(data.id.toString());
    this.name.setValue(data.name);
    this.description.setValue(data.description);
    this.geom.setValue(data.geom);
  }

  useGeomInUrl(){
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.geom.setValue(params.get("geom"));
    });
  }
}
