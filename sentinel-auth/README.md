# Sentinel Auth Backend

Central authentication service for the Sentinel ecosystem.

## Base URLs

| Service | URL |
|---|---|
| Home | `http://127.0.0.1:5000/` |
| API | `http://127.0.0.1:5000/api` |
| Health | `http://127.0.0.1:5000/api/health` |

---

## Home

| Action | Method | Endpoint | Request Body |
|---|---|---|---|
| HOME | `GET` | `http://127.0.0.1:5000/` | None |
| HEALTH | `GET` | `http://127.0.0.1:5000/api/health` | None |

---

## Authentication

| Action | Method | Endpoint | Authentication | Request Body |
|---|---|---|---|---|
| REGISTER | `POST` | `/api/auth/register` | None | [JSON](#register) |
| LOGIN | `POST` | `/api/auth/login` | None | [JSON](#login) |
| REFRESH TOKEN | `POST` | `/api/auth/refresh` | Refresh cookie | None |
| ME | `GET` | `/api/auth/me` | Bearer token | None |
| LOGOUT | `POST` | `/api/auth/logout` | Bearer token | None |
| CHANGE PASSWORD | `PUT` | `/api/auth/change-password` | Bearer token | [JSON](#change-password) |
| FORGOT PASSWORD | `POST` | `/api/auth/forgot-password` | None | [JSON](#forgot-password) |
| RESEND RESET OTP | `POST` | `/api/auth/resend-reset-otp` | None | [JSON](#resend-reset-otp) |
| VERIFY RESET OTP | `POST` | `/api/auth/verify-reset-otp` | None | [JSON](#verify-reset-otp) |
| RESET PASSWORD | `POST` | `/api/auth/reset-password` | Reset token | [JSON](#reset-password) |
| VERIFY EMAIL | `POST` | `/api/auth/verify-email` | None | [JSON](#verify-email) |
| RESEND VERIFICATION OTP | `POST` | `/api/auth/resend-verification-otp` | None | [JSON](#resend-verification-otp) |

---

# Sample Request Bodies

## Register

```json
{
  "name": "Sazad Ahemad",
  "email": "sazad@example.com",
  "username": "sazad",
  "password": "Sentinel@123",
  "confirm_password": "Sentinel@123",
  "organization_name": "Sentinel Technologies"
}
```

## Login

```json
{
  "login": "sazad@example.com",
  "password": "Sentinel@789"
}
```

You can also log in using the username:

```json
{
  "login": "sazad",
  "password": "Sentinel@789"
}
```

## Change Password

```json
{
  "current_password": "Sentinel@789",
  "new_password": "Sentinel@456",
  "confirm_password": "Sentinel@456"
}
```

## Forgot Password

```json
{
  "email": "sazad@example.com"
}
```

## Resend Reset OTP

```json
{
  "email": "sazad@example.com"
}
```

## Verify Reset OTP

```json
{
  "email": "sazad@example.com",
  "otp": "483921"
}
```

Successful OTP verification returns a short-lived, one-time `reset_token`.

## Reset Password

```json
{
  "reset_token": "{{sentinel_password_reset_token}}",
  "password": "Sentinel@789",
  "confirm_password": "Sentinel@789"
}
```

## Verify Email

```json
{
  "email": "sazad@example.com",
  "otp": "483921"
}
```

## Resend Verification OTP

```json
{
  "email": "sazad@example.com"
}
```

---

# Authentication Flow

```text
Register
   ↓
Email Verification OTP
   ↓
Verify Email
   ↓
Login
   ↓
Access JWT + Refresh Cookie
   ↓
Protected API Requests
   ↓
Refresh Access Token when required
   ↓
Logout
```

The access token is sent using:

```http
Authorization: Bearer <access_token>
```

The refresh token is stored in the `sentinel_refresh_token` HttpOnly cookie.

Protected requests validate both the JWT and the corresponding active database session.

---

# Email Verification Flow

```text
Register
      ↓
6-digit verification OTP generated
      ↓
OTP sent to email
      ↓
Verify Email
      ↓
users.email_verified_at populated
      ↓
Login enabled
```

Unverified users cannot sign in. Verification OTPs expire, have a maximum attempt count, and can be resent after the configured cooldown.

---

# Forgot Password Flow

```text
Forgot Password
      ↓
6-digit OTP sent to email
      ↓
Verify OTP
      ↓
Short-lived reset token issued
      ↓
Reset Password
      ↓
Reset token consumed
      ↓
All existing sessions revoked
      ↓
User signs in again
```

OTP values are not stored as plain text. Only a secure hash is persisted.

The password reset token is also not stored as plain text. Only its SHA-256 hash is stored.

---

# Postman Variables

Recommended variables:

```text
base_url = http://127.0.0.1:5000/api

sentinel_auth_access_token
sentinel_password_reset_token
```

For protected endpoints, use:

```text
Bearer {{sentinel_auth_access_token}}
```

After successful login or token refresh, save the returned access token to `sentinel_auth_access_token`.

After successful OTP verification, save the returned reset token to `sentinel_password_reset_token`.

---

# Environment Variables

Create a `.env` file in the backend root.

```env
APP_NAME=Sentinel Auth
NODE_ENV=development
PORT=5000

FRONTEND_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sentinel_auth
DB_USER=root
DB_PASSWORD=

JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=change-this-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

MAIL_HOST=
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USERNAME=
MAIL_PASSWORD=

MAIL_FROM_NAME=Sentinel
MAIL_FROM_ADDRESS=no-reply@sentinel.local

MAIL_DEBUG=true

PASSWORD_RESET_OTP_EXPIRES_MINUTES=10
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=10
PASSWORD_RESET_MAX_ATTEMPTS=5
PASSWORD_RESET_RESEND_COOLDOWN_SECONDS=60

EMAIL_VERIFICATION_OTP_EXPIRES_MINUTES=10
EMAIL_VERIFICATION_MAX_ATTEMPTS=5
EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS=60
```

Do not commit your real `.env` file. Keep `.env.example` in the repository.

---

# Installation

Install dependencies:

```bash
npm install
```

Run database migrations:

```bash
npx sequelize-cli db:migrate
```

Start development server:

```bash
npm run dev
```

Production start:

```bash
npm start
```

---

# Database

Sentinel Auth currently uses:

- MySQL
- Sequelize ORM
- Sequelize CLI migrations

Important authentication-related tables include:

```text
users
organizations
organization_members
sessions
password_reset_requests
email_verification_requests
```

Database schema changes should be made through migrations. Do not use `sequelize.sync()` as a replacement for migrations.

---

# Current Features

- User registration
- Organization creation during registration
- Login using email or username
- JWT access tokens
- Database-backed sessions
- Opaque refresh tokens
- Refresh-token hashing
- Refresh-token rotation
- HttpOnly refresh-token cookie
- Protected `/me` endpoint
- Session-aware authentication middleware
- Logout and session revocation
- Change password
- Forgot password
- Email OTP password-reset verification
- OTP expiration
- OTP attempt limits
- OTP resend cooldown
- One-time password-reset tokens
- Password reset
- Revocation of all sessions after password reset
- Registration email verification
- Email verification OTP expiration and attempt limits
- Email verification OTP resend cooldown
- Login blocked until email verification
- Authentication endpoint rate limiting

---

# Rate Limiting

Sensitive authentication endpoints are protected with API rate limiting, including login, password recovery, OTP verification/resend, password reset, and email verification flows.

The current development setup can use the default in-memory rate-limit store. A shared store such as Redis can be introduced later when Sentinel runs across multiple application instances.

---

# Development Notes

When SMTP is not configured and:

```env
NODE_ENV=development
MAIL_DEBUG=true
```

password-reset and email-verification OTPs can be printed in the backend terminal for local testing.

Never return OTP values in API responses.

For production, configure a real mail provider and disable `MAIL_DEBUG`.

---

# Next Planned Work

- React + Vite authentication frontend
- Real SMTP provider configuration
- OAuth 2.0 / OpenID Connect foundation
- Sentinel ecosystem SSO
