# 📊 Storydoc - Interactive Presentation Generator for JustJoinIT

Automatyczne generowanie interaktywnych prezentacji sprzedażowych z integracją Pipedrive. Zbudowane dla JustJoinIT.

## ✨ Funkcje

- 🎨 **Scrollytelling** - Interaktywne prezentacje z animacjami scroll-based (GSAP)
- 🔗 **Dwa typy linków**:
  - 👁️ View-only - Prezentacja dla klienta
  - ✏️ Editable - Link do edycji zmiennych
- 📊 **Analytics** - Śledzenie otwarć, czasu, scroll depth, kliknięć
- 🔄 **Integracja Pipedrive** - Automatyczne generowanie z webhook
- 📱 **Responsywne** - Działa na desktop, tablet i mobile
- 🎯 **Szablon JustJoinIT** - Gotowy szablon dla ofert sprzedażowych

## 🏗️ Architektura

```
storydoc/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # React + TypeScript + Vite + GSAP
└── shared/           # Współdzielone typy TypeScript
```

### Stack Technologiczny

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Puppeteer (PDF export)

**Frontend:**
- React 18
- TypeScript
- Vite
- GSAP + ScrollTrigger (scrollytelling)
- TailwindCSS
- Zustand (state management)
- Axios

## 🚀 Instalacja i Uruchomienie

### Wymagania

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm lub yarn

### 1. Klonowanie repozytorium

```bash
git clone <repo-url>
cd storydoc
```

### 2. Instalacja zależności

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Konfiguracja bazy danych

Utwórz bazę PostgreSQL:

```bash
createdb storydoc
```

Skonfiguruj `.env` w folderze `backend`:

```bash
cp backend/.env.example backend/.env
```

Edytuj `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/storydoc?schema=public"
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-this
PIPEDRIVE_API_TOKEN=your-pipedrive-token
```

### 4. Migracja bazy danych

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Uruchomienie w trybie deweloperskim

Otwórz dwa terminale:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Aplikacja będzie dostępna pod:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🔧 Konfiguracja Pipedrive Webhook

1. Zaloguj się do Pipedrive
2. Przejdź do **Settings** → **Webhooks**
3. Dodaj nowy webhook:
   - **URL**: `https://your-domain.com/api/webhooks/pipedrive`
   - **Events**: `deal.updated`, `deal.added`
   - **HTTP Method**: POST
4. Zapisz webhook

Gdy deal zostanie zaktualizowany w Pipedrive, automatycznie wygeneruje się prezentacja z dwoma linkami:
- **View URL** - do wysłania klientowi
- **Edit URL** - do edycji zmiennych

## 📦 Deployment

### Opcja 1: Vercel (Frontend) + własny serwer (Backend)

**Backend:**

```bash
cd backend
npm run build
npm start
```

Możesz użyć PM2 do zarządzania procesem:

```bash
npm install -g pm2
pm2 start dist/server.js --name storydoc-backend
pm2 save
pm2 startup
```

**Frontend (Vercel):**

```bash
cd frontend
npm run build
```

Wdróż na Vercel:

```bash
npm install -g vercel
vercel
```

W ustawieniach Vercel dodaj zmienną środowiskową:
- `VITE_API_URL`: URL twojego backendu

### Opcja 2: Docker (Całość)

Stwórz `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: storydoc
      POSTGRES_USER: storydoc
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://storydoc:your-password@postgres:5432/storydoc
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://localhost:3001

volumes:
  postgres_data:
```

Uruchom:

```bash
docker-compose up -d
```

### Opcja 3: Własny serwer (wszystko razem)

Używając nginx jako reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/storydoc/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📖 Użycie API

### Tworzenie prezentacji

```bash
POST /api/presentations
Content-Type: application/json

{
  "title": "Proposal for Client X",
  "templateId": "justjoinit-proposal",
  "content": { ... },
  "settings": { ... }
}
```

### Tworzenie wersji (z linkami)

```bash
POST /api/versions
Content-Type: application/json

{
  "presentationId": "clx...",
  "recipientName": "Jan Kowalski",
  "recipientEmail": "jan@example.com",
  "variables": {
    "clientName": "Company XYZ",
    "totalPrice": 50000
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "viewUrl": "https://yourapp.com/view/abc123?token=...",
    "editUrl": "https://yourapp.com/edit/abc123?token=..."
  }
}
```

## 🎨 Dostosowywanie Szablonu

Edytuj `backend/src/services/templateGenerator.ts` aby dostosować szablon JustJoinIT

## 📊 Analityka

Dashboard analytics dostępny pod: `GET /api/analytics/presentation/:presentationId`

## 🔒 Bezpieczeństwo

- ✅ Rate limiting (150 req/min)
- ✅ Helmet.js (security headers)
- ✅ CORS configuration
- ✅ Token-based access (view & edit)
- ✅ SQL injection protection (Prisma)

## 📝 License

MIT License

---

Made with ❤️ for JustJoinIT