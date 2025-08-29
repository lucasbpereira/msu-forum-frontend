import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Questions {
    id: number,
    user_id: number,
    title: string,
    body: string,
    votes: number,
    view_count: number,
    answer_count: number,
    is_solved: boolean,
    created_at: string,
    updated_at: string,
    username: string,
    avatar_url: string,
}

const API = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  apiUrl: string = API;
  constructor(private http: HttpClient) { }

  getLastQuestions() {
    return this.http.get<Questions[]>(`${this.apiUrl}questions`)
  }

  getSearchResults(value: string) {
    let params = new HttpParams().set('q', value); // adiciona ?q=valor na URL
    return this.http.get<Questions[]>(`${this.apiUrl}questions/search`, { params });
  }

}
