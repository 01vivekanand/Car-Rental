# Car Dealership Inventory System

A full-stack inventory app for a car dealership, built for the TDD kata. Users register and log in, browse and search the stock, and buy cars. Admins can also add, edit, delete and restock vehicles.

**Live demo:** https://car-rental-delta-cyan.vercel.app
**API:** https://car-rental-api-cgdd.onrender.com

The API runs on Render's free tier and goes to sleep after about 15 minutes without traffic. The first request after that can take up to a minute, so give the login a moment.

Demo admin account: admin@dealership.com / admin123. The live database only holds sample data.
User acount: test@gmail.com/ test@123
## What it does

- Register and log in with JWT authentication
- Dashboard with every vehicle, category tabs, search by make, model and price range, and sorting
- A Purchase button on each car, disabled when the car is out of stock
- Admins can add, edit, delete and restock vehicles from the same page
- Buying a car decreases stock with a single conditional SQL update, so two people buying the last car at the same moment can't push the quantity below zero

## Tech stack

|    Part              |                                               Tools                                                                     |
|---------- -----  |----------------------------------------------------------------------------------- |
| Backend         | Node.js, TypeScript, Express, Prisma, MySQL, jsonwebtoken, bcryptjs |
| Backend tests | Jest, ts-jest, Supertest                                                                                    |
| Frontend         | React, TypeScript, Vite, Tailwind CSS, React Router                               |
| Frontend tests | Vitest, React Testing Library                                                                      |
| Hosting             | Vercel (frontend), Render (API), TiDB Cloud (MySQL database)       |

## How the code is organised
backend/src/
  routes/         HTTP layer: read the request, call a service, send the response
  services/       Business rules (AuthService, VehicleService)
  repositories/   Interfaces for storage, plus the Prisma implementations
  middleware/     JWT check and the admin-only check
  test-utils/     In-memory repositories used by the endpoint tests

frontend/src/
  pages/          Login/register page and the dashboard
  components/     VehicleCard, VehicleForm, car illustrations
  api.ts          All calls to the backend
  auth.tsx        Auth context (stores the token and current user)

The services only know about repository interfaces, not Prisma. That is why the unit tests can run without a database: they pass in a mock or an in-memory repository.

## Running it locally

You need Node.js 20 or newer and a MySQL server.

### 1. Clone
git clone https://github.com/01vivekanand/Car-Rental.git
cd Car-Rental


### 2. Database

Create an empty database in MySQL:
CREATE DATABASE dealership;


### 3. Backend
cd backend
npm install
Copy `.env.example` to `.env` (on Windows: `copy .env.example .env`) and fill it in:

DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/dealership"
JWT_SECRET="any long random string"
PORT=4000
ADMIN_EMAIL="admin@dealership.com"
ADMIN_PASSWORD="admin123"
Then create the tables, add the sample data, and start the server:
npx prisma migrate dev
npm run seed
npm run dev
The seed creates the admin account and nine sample vehicles. The API runs at http://localhost:4000.

### 4. Frontend

In a second terminal:

cd frontend
npm install
npm run dev


Open http://localhost:5173. The frontend talks to `http://localhost:4000` by default. To point it somewhere else, set `VITE_API_URL` (see `frontend/.env.example`).

### Admin accounts

Public registration always creates a normal user. The only way to get an admin is the seed script, which reads ADMIN_EMAIL and ADMIN_PASSWORD from `.env`.

## API

| Method |        Endpoint               | Who can call it |
|----------|--------------------------|-------------------------|
| POST   |    /api/auth/register  |    Anyone                   |
| POST  |      /api/auth/login       |   Anyone                    |
| POST |       /api/vehicles            |   Logged-in users      |
| GET   |       /api/vehicles             |    Logged-in users       |
| GET | /api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=` | Logged-in users |
| PUT | `/api/vehicles/:id` | Logged-in users |
| DELETE | `/api/vehicles/:id` | Admin only |
| POST | `/api/vehicles/:id/purchase` | Logged-in users |
| POST | `/api/vehicles/:id/restock` (body: `{ "amount": 5 }`) | Admin only |

Protected routes expect an `Authorization: Bearer <token>` header. Each vehicle has an id, make, model, category, price and quantity, plus an optional image path.

## Screenshots
<img width="1586" height="815" alt="image" src="https://github.com/user-attachments/assets/dc5a4a94-6dc9-4b13-a185-af27132a62f9" />
<img width="1831" height="917" alt="image" src="https://github.com/user-attachments/assets/59f7ae4f-4838-40c6-a2c2-9754a5dfef0d" />
<img width="598" height="831" alt="image" src="https://github.com/user-attachments/assets/d656527e-4e9d-4c52-8f73-e789ef9087b6" />
<img width="1554" height="710" alt="image" src="https://github.com/user-attachments/assets/aff08e5f-3ce4-4dc2-9821-7311c26ab146" />
<img width="1565" height="772" alt="image" src="https://github.com/user-attachments/assets/c09e1223-28fe-46a8-90ed-40b57950b308" />






## Tests

```bash
cd backend && npm test
cd backend && npm run test:coverage
cd frontend && npm test
```

The backend tests don't need a database. The service tests use mocked repositories, and the Supertest tests run the real Express app against in-memory repositories.

### Test report

Backend:
<img width="895" height="712" alt="Backend Test" src="https://github.com/user-attachments/assets/4637a8a8-2a41-40c0-927b-9ad3ba57c879" />


Frontend:

```
<img width="1005" height="436" alt="Frontend Test" src="https://github.com/user-attachments/assets/a3b84da3-a479-4942-b566-6196eafc8965" />

```

## My AI Usage

**Tool:** Claude (Anthropic), used in the chat window. I also used ideogram to generate the car photos and the hero image. All the chats are in [PROMPTS.md](PROMPTS.md).

**How I used it**

- Choosing the stack and planning the order of work. I picked MySQL myself because it was already installed on my machine.
- Generating boilerplate: the TypeScript, Jest and Prisma setup, the Express app structure, and the Tailwind components.
- Drafting the test cases for the auth service, the vehicle service, and the endpoints, then writing the code that made them pass. The backend history follows test, feat, refactor.
- Debugging. Things that went wrong and got fixed with its help: TypeScript 7 breaking ts-jest, Prisma's Windows file-lock error, the newest Prisma CLI changing its commands, blank files from `New-Item`, and a stacking problem that made the header buttons unclickable.
- Designing the UI. I gave it two reference screenshots and it wrote the layout and styling to match.
- Deployment: the build scripts, the Render settings, and the TiDB connection string format.
- Every commit that used AI has a `Co-authored-by` line.

## Known limitations

- Adding and editing vehicles only needs a login on the server. Only the interface hides those buttons from normal users. Delete and restock are admin-only on the server.
- Most of the frontend was not written test-first. Only the vehicle card has component tests.
- CORS is open to any origin. The API uses bearer tokens rather than cookies, so this is low risk, but it should be locked down for real use.
- No pagination and no rate limiting.
- The demo admin password is public in this file.
