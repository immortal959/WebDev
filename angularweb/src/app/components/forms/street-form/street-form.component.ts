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
import { StreetModel } from '../../../models/street.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-street-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule],
  templateUrl: './street-form.component.html',
  styleUrl: './street-form.component.scss'
})
export class StreetFormComponent implements OnInit{
  geomInUrl = false;
  l: StreetModel[]=[];
  serverMessage = '';

  id = new FormControl('');
  name = new FormControl('', [Validators.required]);
  description = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

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
    this.apiService.post('webcrud/street/insert/', this.controlsGroup.value).subscribe({
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
    this.apiService.get('webcrud/street/selectone/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok){
          var d: StreetModel = response.data[0] as StreetModel;
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
    this.apiService.get('webcrud/street/selectall/').subscribe({
      next: response => {
        this.l = response.data as StreetModel[];
        this.serverMessage=response.message;
      },
      error:error=>{ console.log(error.description) }
    })
  }

  deleteRow(){
    this.serverMessage='';
    if (!this.id.value){ this.serverMessage='Put an id'; return; }
    this.apiService.post('webcrud/street/delete/' + this.id.value + '/').subscribe({
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
    this.apiService.post('webcrud/street/update/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok){ this.selectAll(); }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{ console.log(error.description) }
    })
  }

  clearForm(){ this.controlsGroup.reset(); }
  clearList(){ this.l = []; }

  setDataInForm(data: StreetModel){
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
