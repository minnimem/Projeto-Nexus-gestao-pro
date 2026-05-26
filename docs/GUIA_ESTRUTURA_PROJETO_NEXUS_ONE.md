# Guia de Estrutura do Projeto - Nexus One

Data de referencia: 11/05/2026

Este guia define a organizacao oficial do repositorio Nexus One depois da separacao entre frontend e backend.

## Estrutura Oficial

```text
nexus-gestao-pro/
  frontend/                    React, Vite, Nginx e build web
    src/
    package.json
    package-lock.json
    vite.config.js
    Dockerfile
    nginx.conf
  backend/projectoads/projectoads/
    src/
    pom.xml
    Dockerfile
  docs/                        Documentacao tecnica, comercial e operacional
  scripts/                     Automacoes, validacoes e geradores
  reports/                     Relatorios gerados localmente
  templates/                   Modelos auxiliares
  docker-compose.prod.yml      Compose de producao
  docker-compose.homolog.yml   Compose de homologacao
  package.json                 Atalhos da raiz para o frontend
```

## Regra Principal

- Frontend oficial: `frontend/`.
- Backend oficial: `backend/projectoads/projectoads/`.
- A raiz do projeto serve para orquestracao, documentacao, scripts e Docker Compose.

## Comandos Principais

Na raiz do projeto:

```powershell
npm run dev
npm run build
npm run preview
```

Direto na pasta do frontend:

```powershell
cd frontend
npm run dev
npm run build
```

Backend:

```powershell
cd backend\projectoads\projectoads
mvn spring-boot:run
```

## Docker

O Compose agora usa:

- Frontend: `frontend/Dockerfile`
- Backend: `backend/projectoads/projectoads/Dockerfile`

Valide com:

```powershell
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.homolog.yml config
```

## Checklist de Saude da Estrutura

- [ ] `frontend/src/App.jsx` existe.
- [ ] `frontend/src/styles.css` existe.
- [ ] `frontend/package.json` existe.
- [ ] `frontend/vite.config.js` existe.
- [ ] `frontend/Dockerfile` existe.
- [ ] `frontend/nginx.conf` existe.
- [ ] `backend/projectoads/projectoads/pom.xml` existe.
- [ ] `backend/projectoads/projectoads/src` existe.
- [ ] `docker-compose.prod.yml` aponta para `./frontend`.
- [ ] `docker-compose.homolog.yml` aponta para `./frontend`.
- [ ] `npm run build` funciona pela raiz.

## Verificador Automatico

Use:

```powershell
.\scripts\verificar-estrutura-projeto.ps1
```

O script valida arquivos principais, paths oficiais e comandos sugeridos.

