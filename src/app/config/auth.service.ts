// src/app/services/auth.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of, timeout } from 'rxjs';
import { Router } from '@angular/router';

export interface CharacterData {
  level: number;
  imageUrl: string;
}

// Interface para um único personagem no array
export interface Character {
  name: string;
  data: CharacterData;
}

// Interface para o objeto de usuário
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  password: string;
  phone: string;
  reputation: number;
  role: string;
  wallet: string;
  created_at: string; // Pode ser tipado como Date se for convertido
  last_seen: string;  // Pode ser tipado como Date se for convertido
  is_active: boolean;
  avatar_url: string;
}

// Interface principal que representa a raiz do objeto JSON
export interface User {
  characters: Character[];
  user: UserInfo;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Sua URL da API
  private isCheckingAuth = false;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly STORAGE_KEY = 'msu_forum_user'; // Key for localStorage

  // Signal para manter o estado do usuário. Inicia como null (deslogado).
  private readonly _currentUser = signal<User | null>(null);
  private readonly _authError = signal<string | null>(null);

  // Signal público somente leitura para que os componentes possam acessar o estado.
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly authError = this._authError.asReadonly();

  // Computed signal para verificar se o usuário está logado
  public readonly isAuthenticated = computed(() => this._currentUser() !== null);

  // Computed signal para obter informações do usuário logado
  public readonly userInfo = computed(() => this._currentUser()?.user ?? null);

  // Computed signal para obter os personagens do usuário
  public readonly userCharacters = computed(() => this._currentUser()?.characters ?? []);

  constructor(private http: HttpClient, private router: Router) {
    // Restore user data from localStorage on service initialization
    this.loadUserFromStorage();

    // Apenas verifica o estado se não estiver já verificando
    if (!this.isCheckingAuth) {
      this.checkAuthState().subscribe({
        complete: () => {
          console.log('Initial auth check completed');
        }
      });
    }
  }

  // Método para carregar usuário do localStorage
  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser) as User;
        this._currentUser.set(userData);
        console.log('User data restored from localStorage');
      }
    } catch (error) {
      console.warn('Failed to load user data from storage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Método para salvar usuário no localStorage
  private saveUserToStorage(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        console.log('User data saved to localStorage');
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('User data removed from localStorage');
      }
    } catch (error) {
      console.warn('Failed to save user data to storage:', error);
    }
  }

  // Método para verificar se há uma sessão ativa no backend
  checkAuthState(): Observable<User | null> {
    // Previne múltiplas requisições simultâneas
    if (this.isCheckingAuth) {
      return of(this._currentUser());
    }

    // Se já temos dados do localStorage, retorna sem fazer nova requisição
    const currentUser = this._currentUser();
    if (currentUser) {
      console.log('Using cached user data from localStorage');
      return of(currentUser);
    }

    this.isCheckingAuth = true;
    this._authError.set(null);

    return this.http.get<User>(`${this.apiUrl}/api/v1/check-auth`).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(user => {
        // Se o backend retornar 200 OK com o usuário, atualizamos nosso estado
        this._currentUser.set(user);
        this.saveUserToStorage(user);
        this.isCheckingAuth = false;
      }),
      catchError((error: HttpErrorResponse) => {
        // Se der erro (401, 403, etc.), garantimos que o estado é 'deslogado'
        this._currentUser.set(null);
        this.saveUserToStorage(null);
        this.isCheckingAuth = false;

        if (error.status === 0) {
          this._authError.set('Servidor indisponível');
          console.warn('Auth server unavailable, continuing offline');
        } else {
          console.log('User not authenticated');
        }

        return of(null); // Retorna um observable 'nulo' para não quebrar a cadeia
      })
    );
  }

  // Login agora atualiza o estado com os dados do usuário retornados
  login(wallet: string) {
    this._authError.set(null);
    return this.http.post<User>(`${this.apiUrl}/login`, { wallet }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(user => {
        this._currentUser.set(user);
        this.saveUserToStorage(user);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this._authError.set('Servidor indisponível');
        } else {
          this._authError.set('Erro no login');
        }
        throw error;
      })
    );
  }

  // Register faz o mesmo que o login
  register(wallet: string) {
    this._authError.set(null);
    return this.http.post<User>(`${this.apiUrl}/register`, { wallet }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(user => {
        this._currentUser.set(user);
        this.saveUserToStorage(user);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this._authError.set('Servidor indisponível');
        } else {
          this._authError.set('Erro no registro');
        }
        throw error;
      })
    );
  }

  // Logout limpa o estado e redireciona
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      timeout(5000), // Timeout menor para logout
      catchError(() => {
        // Mesmo se a chamada falhar (ex: rede offline), limpe o estado no frontend
        console.warn('Logout request failed, clearing local state');
        return of(null);
      })
    ).subscribe({
      next: () => {
        this._currentUser.set(null);
        this._authError.set(null);
        this.saveUserToStorage(null);
      },
      error: () => {
        this._currentUser.set(null);
        this._authError.set(null);
        this.saveUserToStorage(null);
      }
    });
  }

  // Método para atualizar o usuário manualmente (se necessário)
  setUser(user: User | null): void {
    this._currentUser.set(user);
    this.saveUserToStorage(user);
  }

  // Getter para obter o valor atual do usuário de forma síncrona
  getCurrentUser(): User | null {
    return this._currentUser();
  }

  // Método para limpar erros
  clearError(): void {
    this._authError.set(null);
  }

  // Método para verificar se há dados persistidos (para debug)
  hasPersistedData(): boolean {
    try {
      return !!localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return false;
    }
  }

  // Método para limpar dados persistidos manualmente
  clearPersistedData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this._currentUser.set(null);
      console.log('Persisted user data cleared');
    } catch (error) {
      console.warn('Failed to clear persisted data:', error);
    }
  }
}
