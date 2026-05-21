import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = 'http://127.0.0.1:8001/webcrud';

  constructor(private http: HttpClient) {}

  insert(table: string, data: any) {
    return this.http.post(this.baseUrl + '/' + table + '/insert/', data);
  }

  selectAll(table: string) {
    return this.http.get(this.baseUrl + '/' + table + '/selectall/');
  }

  selectOne(table: string, id: number) {
    return this.http.get(this.baseUrl + '/' + table + '/selectone/' + id + '/');
  }

  update(table: string, id: number, data: any) {
    return this.http.post(this.baseUrl + '/' + table + '/update/' + id + '/', data);
  }

  delete(table: string, id: number) {
    return this.http.post(this.baseUrl + '/' + table + '/delete/' + id + '/', {});
  }
}