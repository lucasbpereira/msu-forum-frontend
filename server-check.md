# Guia de Resolução - Requisições Contínuas

## Problema Identificado
O aplicativo estava fazendo requisições HTTP contínuas para `http://localhost:3000` que estavam falhando com `ERR_CONNECTION_REFUSED`.

## Correções Implementadas

### 1. Correção dos Effects em Componentes
- **QuestionComponent**: Adicionado flag `hasInitialized` para evitar loop infinito
- **HeaderComponent**: Implementado controle de inicialização única
- **NavbarComponent**: Prevenido carregamento múltiplo de tags

### 2. Melhorias nos Services
- **QuestionService**: Adicionado retry logic e circuit breaker
- **TagService**: Implementado controle de requisições simultâneas
- **AuthService**: Melhorado timeout e error handling

### 3. Prevenção de Requisições Múltiplas
- Guards para prevenir chamadas simultâneas
- Reset automático de retry counters em caso de sucesso
- Timeouts configuráveis para evitar travamentos

## Como Iniciar o Servidor

### Para o Frontend (Angular):
```bash
cd c:\Users\lucas\Documents\github\msu-forum-frontend
npm install
ng serve
```
Acesse: http://localhost:4200

### Para o Backend (assumindo Node.js/Express):
Você precisa ter um servidor rodando em `http://localhost:3000`. 

Se você não tem o backend ainda, crie um servidor simples:

```bash
# Em uma nova pasta para o backend
npm init -y
npm install express cors
```

Crie um arquivo `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock endpoints
app.get('/questions', (req, res) => {
  res.json([
    { id: 1, title: 'Questão Test', body: 'Conteúdo test', votes: 0, view_count: 1, answer_count: 0, is_solved: false, created_at: new Date(), updated_at: new Date(), username: 'test', avatar_url: '' }
  ]);
});

app.get('/tags', (req, res) => {
  res.json([
    { id: 1, name: 'javascript', description: 'JavaScript questions', usageCount: 10, createdAt: new Date() }
  ]);
});

app.post('/login', (req, res) => {
  res.json({ user: { id: 1, wallet: req.body.wallet }, characters: [] });
});

app.post('/register', (req, res) => {
  res.json({ user: { id: 1, wallet: req.body.wallet }, characters: [] });
});

app.listen(3000, () => {
  console.log('Mock server running on http://localhost:3000');
});
```

```bash
node server.js
```

## Comportamento Agora
- ✅ Componentes fazem requisições apenas uma vez na inicialização
- ✅ Errors são tratados graciosamente sem loops infinitos
- ✅ Retry automático com delays apropriados
- ✅ Timeouts para evitar travamentos
- ✅ Circuit breaker para prevenir sobrecarga do servidor

## Monitoramento
Os logs no console agora mostrarão:
- "Questions loaded successfully" / "Tags loaded successfully" apenas uma vez
- Mensagens de retry quando apropriado
- Errors claros sobre status do servidor
