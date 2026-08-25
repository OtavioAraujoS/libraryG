# 🎮 LibraryG — Centralizador de Bibliotecas de Jogos

Centralize e gerencie todos os seus jogos da **Steam**, **Epic Games** e **GOG** em um único painel moderno com suporte à Família Steam e estatísticas de tempo de jogo.

---

## 🚀 Guia Rápido de Instalação (Passo a Passo)

### 1. Instalar as Dependências
```bash
npm install
```

### 2. Configurar o Ambiente
Copie o arquivo de exemplo para criar o `.env`:
```bash
cp .env.example .env
```
*(Opcional: preencha suas chaves da Steam, Epic Games e GOG para sincronização).*

### 3. Inicializar o Banco de Dados (SQLite local)
Crie as tabelas locais executando o comando de setup:
```bash
npm run setup
# ou
npx prisma db push
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra **[http://localhost:3000](http://localhost:3000)** no seu navegador para ver o painel!

---

## 🛠️ Comandos Úteis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor Next.js em modo desenvolvimento (watch mode / hot reload) |
| `npm run setup` | Gera o Prisma Client e sincroniza as tabelas do banco local |
| `npm run db:push` | Sincroniza o schema do Prisma com o banco de dados |
| `npm run db:studio` | Abre a interface gráfica do Prisma Studio para visualizar e editar dados |
| `npm run build` | Compila a aplicação para produção |
| `npm run start` | Inicia a aplicação compilada em produção |

---

### Quick Start with Docker

#### 1. Development Mode (Fast startup + Hot-Reload)
Starts the app in development mode using the mounted volume, so any code changes reflect immediately without rebuilding the image:
```bash
npm run docker:dev
# or
docker compose -f docker-compose.dev.yml up
```

#### 2. Production Mode (Standalone Build + Caching)
Runs the optimized production standalone image:
```bash
npm run docker
# or (to force rebuild)
npm run docker:build
# or
docker compose up --build
```

#### 3. Stop Containers
```bash
npm run docker:down
```

### Run with Docker CLI

1. Build the Docker image (uses BuildKit caching for npm and Next.js builds):
   ```bash
   docker build -t libraryg:latest .
   ```

2. Run the container:
   ```bash
   docker run -d --name libraryg-app -p 3000:3000 --env-file .env libraryg:latest
   ```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
