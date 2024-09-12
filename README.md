<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

# Descrição

Respositório backend do projeto Logflow

# Executando o projeto

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
$ npm install
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
$ docker compose up
```

## Prefixo para executar comandos dentro do container do backend
```bash
$ docker compose exec backend "comando"
```