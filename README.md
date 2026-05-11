# HairSalonBookingApp

REST API backend for a hair salon booking application. This system provides a comprehensive platform for managing customer appointments, staff scheduling, services, payments, and salon operations.

## Features

- User authentication and authorization (JWT)
- Booking management with multiple status tracking
- Staff and stylist management
- Service catalog management
- Work shift scheduling
- Payment processing
- Feedback and reviews
- News and promotions
- Salary management for staff

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **API Documentation:** Swagger (swagger-ui-express)
- **Scheduler:** node-cron
- **Email:** Nodemailer

## Project Structure

```
HairSalonBookingApp/
├── api/v1/
│   ├── controller/   # Request handling logic
│   ├── middleware/  # Middleware (auth, validation)
│   ├── repositories/ # Database interactions
│   ├── routes/       # API endpoint definitions
│   └── services/     # Business logic
├── config/           # Configuration (swagger, database)
├── helper/           # Utility functions
├── model/            # Models and database schema
├── schedules/        # Cron jobs
├── validates/        # Validation rules
├── sql/              # SQL scripts (init, sample data)
├── index.js          # Entry point
└── package.json      # Dependencies
```

## API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `/api/v1/auth/*` | Login, register, refresh token |
| Booking | `/api/v1/booking/*` | Booking management |
| Customer | `/api/v1/customer/*` | Customer management |
| Feedback | `/api/v1/feedback/*` | Service feedback |
| Guest | `/api/v1/guest/*` | Guest users |
| Manager | `/api/v1/manager/*` | Manager functions |
| News | `/api/v1/news/*` | News and promotions |
| Payment | `/api/v1/payment/*` | Payment processing |
| Salary | `/api/v1/salary/*` | Staff salary management |
| Service | `/api/v1/service/*` | Salon services |
| Staff | `/api/v1/staff/*` | Staff management |
| Stylist | `/api/v1/stylist/*` | Stylist management |
| User | `/api/v1/user/*` | User management |
| Workshift | `/api/v1/workshift/*` | Work shift scheduling |

## Installation

```bash
# Install dependencies
npm install

# Run server (development)
npm start
```

## Configuration

Create `.env` file with environment variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hairsalon
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

## Database

- Run `sql/init_database.sql` to initialize database
- Run `sql/sample_data.sql` to add sample data

## API Documentation

After starting the server, access:
```
http://localhost:3000/api-docs
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run server with nodemon |
| `npm test` | Run tests |