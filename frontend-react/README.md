# Insecure Bank React Frontend

A React-based web frontend for the Insecure Bank application, built for educational purposes to demonstrate common web application vulnerabilities.

## Features

- **User Authentication**
  - Registration with OTP verification
  - Login with phone number and password
  - Device enrollment
  - PIN setup for transactions

- **Banking Operations**
  - View account balances
  - Transfer money between accounts
  - Transaction history
  - Account inquiry

- **Security Features (Intentionally Vulnerable)**
  - PIN-based transaction validation
  - JWT authentication
  - Basic input validation

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Custom CSS with responsive design
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
cd frontend-react
npm install
npm start
```

### Build for Production
```bash
npm run build
```

## Docker

Build and run with Docker:
```bash
docker build -t insecure-bank-react .
docker run -p 3001:80 insecure-bank-react
```

## Usage

1. **Registration**: Create a new account with phone number verification
2. **Login**: Sign in with phone number and password
3. **Set PIN**: Configure a 4-digit PIN for transactions
4. **Dashboard**: View accounts and transaction history
5. **Transfer**: Send money to other accounts with PIN validation
6. **Account Inquiry**: Look up account details

## Security Warnings

⚠️ **This application contains intentional security vulnerabilities for educational purposes. Do not use in production!**

Common vulnerabilities demonstrated:
- Plain text PIN storage
- Client-side validation only
- Sensitive information exposure
- Lack of proper authentication checks
- SQL injection possibilities
- XSS vulnerabilities

## API Integration

The React frontend communicates with:
- **Auth Service** (port 8080): User authentication and registration
- **Transaction Service** (port 8081): Banking operations
- **API Gateway** (port 9090): Unified API endpoint

All API calls go through the API Gateway at `http://localhost:9090`

## Contributing

This is an educational project. When adding features, ensure they maintain the intentionally vulnerable nature while providing clear learning examples.