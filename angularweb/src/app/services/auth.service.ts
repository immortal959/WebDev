import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ServerAnswerModel } from '../models/server-answer.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public username: string = '';
  public isAuthenticated: boolean = false;
  public userGroups: string[] = [];
  public isEditor: boolean = false;
  public isReader: boolean = false;

  constructor(public apiService: ApiService) {
    this.checkIsLoggedInInServer();
  }

  checkIsLoggedInInServer() {
    this.apiService.post('core/isloggedin/', {}).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) {
          this.username = response.data[0]['username'];
          this.isAuthenticated = true;
          this.userGroups = response.data[0]['groups'] || [];
          this.isEditor = this.userGroups.includes('editor');
          this.isReader = this.userGroups.includes('reader') || this.isEditor;
        }
      },
      error: (error: any) => {
        console.log(error.description);
      }
    });
  }
}