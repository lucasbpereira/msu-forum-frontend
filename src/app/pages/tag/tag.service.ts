import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Questions } from '../question/question.service';

const API = environment.API_URL;

export interface Tags {
    id: number;
    name: string;
    description: string;
    usageCount: number;
    createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {

  apiUrl: string = API;
  constructor(private http: HttpClient) { }

  getTags() {
    return this.http.get<Tags[]>(`${this.apiUrl}tags`)
  }
}
