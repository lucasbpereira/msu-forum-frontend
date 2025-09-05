import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // ajuste para sua API
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(wallet: string) {
    return this.http.post<UserInfo>(`${this.apiUrl}/login`, { wallet })
  }

  register(wallet: string) {
    return this.http.post<UserInfo>(`${this.apiUrl}/register`, { wallet });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
