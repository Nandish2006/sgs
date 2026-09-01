# The Docket — Smart Grievance System

ASP.NET Core Web API (C#, EF Core, SQL Server) backend + a separate React (Vite) frontend.

- Anyone can **file a grievance** and gets back a ticket ID (e.g. `GRV-2026-00042`).
- Anyone can **track a case** by ticket ID — no login needed.
- An **admin** signs in (JWT-protected) to view all cases, filter by status, and resolve them with a note.

---

## 1. Backend setup (`/backend/GrievanceApi`)

**Prerequisites:** .NET 8 SDK, SQL Server (LocalDB is fine — ships with Visual Studio).

```bash
cd backend/GrievanceApi
dotnet restore
```

### Configure the database

Check `appsettings.json` — the default connection string uses LocalDB:

```
Server=(localdb)\mssqllocaldb;Database=GrievanceSystemDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```

If you're using full SQL Server instead, replace it with your own connection string.

### Create and apply the migration

The project has no migration yet — generate one (this is normal, EF migrations are meant to be created against your own machine/SDK):

```bash
dotnet tool install --global dotnet-ef   # skip if you already have it
dotnet ef migrations add InitialCreate
dotnet ef database update
```

This creates the `Grievances` and `AdminUsers` tables and seeds one admin account:

- **Username:** `admin`
- **Password:** `Admin@123`

(Change this in a real deployment — it's fine for a coursework demo.)

### Run the API

```bash
dotnet run
```

By default it runs at `http://localhost:5080` (see `Properties/launchSettings.json`). Swagger UI opens automatically at `/swagger` — use it to try endpoints directly, including logging in and pasting the returned JWT into the "Authorize" button to hit admin routes.

**Before your first run for real use**, replace the placeholder JWT signing key in `appsettings.json` (`Jwt:Key`) with your own long random string — it's fine to leave as-is for local dev/demo.

---

### Set up email notifications (optional but recommended)

The API now emails the person automatically:
- when they submit a grievance (their ticket ID)
- whenever an admin updates the status (new status + any resolution note)

If SMTP isn't configured, submissions and status updates still work fine — the API just logs a warning and skips the email. To turn emails on, edit the `Smtp` section in `appsettings.json`:

```json
"Smtp": {
  "Host": "smtp.gmail.com",
  "Port": 587,
  "Username": "tagarmy252@gmail.com",
  "Password": "Nandish@8282",
  "FromName": "The Docket — Grievance Redressal",
  "EnableSsl": true
}
```

**Using Gmail:** you can't use your normal Gmail password here — Google requires an **App Password**:
1. Turn on 2-Step Verification on the Google account you'll send from (Google Account → Security).
2. Go to https://myaccount.google.com/apppasswords, generate a new app password (name it "Grievance System"), and paste the 16-character code into `Password` above.
3. Use that same Gmail address as `Username`.

Any other SMTP provider (Outlook, your college's mail server, etc.) works too — just swap `Host`/`Port` accordingly.

---

## 2. Frontend setup (`/frontend`)

**Prerequisites:** Node.js 18+.

```bash
cd frontend
npm install
cp .env.example .env   # points the app at http://localhost:5080/api — edit if your API runs elsewhere
npm run dev
```

Opens at `http://localhost:5173`.

---

## 3. Using it

1. Go to `http://localhost:5173` → file a grievance → note the ticket ID shown.
2. Go to **Track Status** → paste the ticket ID → see its live status.
3. Go to **Admin** → sign in with `admin` / `Admin@123` → see the case queue, filter by status, click a case, update its status and add a resolution note.
4. Go back to **Track Status** with the same ticket ID → the update and note now show up.

---

## Project structure

```
backend/GrievanceApi/
  Controllers/       GrievancesController, AuthController
  Models/             Grievance, AdminUser (+ enums for Status/Category)
  Dtos/                Request/response shapes (never expose EF entities directly)
  Data/                AppDbContext (seeds the admin user)
  Services/           TokenService (JWT issuing)
  Program.cs           DI, CORS, JWT auth, Swagger, auto-migrate on startup

frontend/src/
  pages/               SubmitPage, TrackPage, AdminLoginPage, AdminDashboardPage
  components/          Navbar, StatusStamp (the ticket-stamp visual)
  api.js               Single fetch wrapper for all backend calls
  styles/index.css     Design tokens + all styling (no UI framework)
```

## API reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/grievances` | Public | Submit a grievance, returns ticket ID |
| GET | `/api/grievances/track/{ticketId}` | Public | Look up status by ticket ID |
| POST | `/api/auth/login` | Public | Admin login, returns JWT |
| GET | `/api/grievances?status=Pending` | Admin (JWT) | List all cases, optional status filter |
| PUT | `/api/grievances/{id}/status` | Admin (JWT) | Update status + resolution note |

## If you're short on time before submission

- The auto-migration on startup (`db.Database.Migrate()` in `Program.cs`) means once you've created the migration once, the schema is applied automatically every time you run the API — no manual `database update` needed after that.
- If SQL Server setup is giving you trouble and you just need something running fast, you can swap `UseSqlServer(...)` for `UseSqlite("Data Source=grievance.db")` in `Program.cs` (and change the package reference in the `.csproj` from `Microsoft.EntityFrameworkCore.SqlServer` to `Microsoft.EntityFrameworkCore.Sqlite`) — zero setup, same code otherwise.
- Swagger (`/swagger`) is your fastest way to demo the API working independently of the frontend, if you need to show backend functionality separately in a viva.
