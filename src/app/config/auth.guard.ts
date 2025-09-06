// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usando signals para verificação direta do estado de autenticação
  if (authService.isAuthenticated()) {
    return true; // Usuário está logado, permite o acesso
  } else {
    // Usuário não está logado, redireciona para a página inicial
    router.navigate(['/']);
    return false;
  }
};
