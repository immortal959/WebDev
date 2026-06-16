import { Component } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from "@angular/material/input";
import { MatTooltip } from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import { CommonModule } from '@angular/common';

import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { ApiService } from '../../../services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  serverMessage = '';

  username = new FormControl('', [Validators.required, Validators.minLength(4)]);
  password = new FormControl('', [Validators.required, Validators.minLength(4)]);

  controlsGroup = new FormGroup({
    username: this.username,
    password: this.password,
  })

  constructor(private apiService:ApiService, private authService: AuthService){}

  login(){
    this.serverMessage='';
    this.apiService.post('core/login/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok){
          this.authService.username = this.username.value!;
          this.authService.isAuthenticated = true;
          this.authService.checkIsLoggedInInServer();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })
  }
}
