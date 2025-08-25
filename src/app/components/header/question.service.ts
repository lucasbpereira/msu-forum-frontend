import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  apiUrl: string = "http://localhost:3000/"
  constructor(private http: HttpClient) { }

  getLastQuestions() {
    return this.http.get<Questions[]>(`${this.apiUrl}questions`)
  }

}
