<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

# Descrição

Respositório backend do projeto Logflow

# Configurações iniciais

1. **Acesse o Google Cloud Console**:
   - Vá para [Google Cloud Console](https://console.cloud.google.com/).

2. **Crie um novo projeto**:
   - Clique no menu suspenso do projeto no topo da página.
   - Selecione "Novo Projeto".
   - Dê um nome ao seu projeto e clique em "Criar".

3. **Ative a API do Google**:
   - No menu de navegação, vá para "APIs e Serviços" > "Biblioteca".
   - Pesquise por "Google Calendar API" e clique em "Ativar".

4. **Configure a tela de consentimento OAuth**:
   - No menu de navegação, vá para "APIs e Serviços" > "Tela de consentimento OAuth".
   - Escolha "Externo" e clique em "Criar".
   - Preencha as informações necessárias, como nome do aplicativo, e-mail de suporte, e adicione os escopos necessários. Exemplo: `https://www.googleapis.com/auth/calendar`.
   - Clique em "Salvar e continuar".

5. **Crie credenciais OAuth2**:
   - No menu de navegação, vá para "APIs e Serviços" > "Credenciais".
   - Clique em "Criar credenciais" e selecione "ID do cliente OAuth".
   - Selecione "Aplicativo da Web" como tipo de aplicativo.
   - Adicione os URIs de redirecionamento autorizados (por exemplo, `http://localhost:3000`).
   - Clique em "Criar".

6. **Obtenha as credenciais**:
   - Após criar as credenciais, você verá o `CLIENT_ID` e o `CLIENT_SECRET`.
   - Copie esses valores e adicione ao seu arquivo `.env`

## Variáveis de ambiente Localhost

Cria um arquivo .env e preencha com as informações necessárias conforme o exemplo abaixo:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_ADMIN_EMAIL=admin@gmail.com
DB_PASSWORD=postgres
DB_NAME=logflowdb

SECRET_JWT=logflowbackend

CLIENT_ID=847748011399-****.apps.googleusercontent.com
CLIENT_SECRET=GOCSPX-**-******
REDIRECT_URI=http://localhost:3000
```

## Variáveis de ambiente Docker

Cria um arquivo .env e preencha com as informações necessárias conforme o exemplo abaixo:

```bash
DB_HOST=postgres
DB_PORT=5433
DB_USERNAME=postgres
DB_ADMIN_EMAIL=admin@gmail.com
DB_PASSWORD=postgres
DB_NAME=logflowdb

SECRET_JWT=logflowbackend
```

### Executando manualmente

#### Instalação

```bash
npm install
```

#### Executar o projeto

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Executando com docker

```bash
docker compose up
```

## Prefixo para executar comandos dentro do container do backend

```bash
docker compose exec backend "comando"
```
