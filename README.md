# RidePay 🚗💳
<img width="1354" height="675" alt="image" src="https://github.com/user-attachments/assets/0cfee6f3-3c85-4846-a2da-6024d85e85d9" />

> **Enyata x Interswitch Buildathon Submission**  
> **Seamless Digital Payments for Modern Ride-Sharing**

A full-stack, real-time payment platform that connects riders and passengers through a secure digital wallet ecosystem, powered by Interswitch.

---

## 🏆 Buildathon Submission Details
*Important information for judges regarding the Enyata x Interswitch Buildathon.*

- **Team Code:** `c5a056`
- **Live URL:** `https://ridepay.vercel.app`
- **Repository:** This single repository contains both our Frontend (`/frontend`) and Backend (`/backend`).

### 🔐 Test Credentials
To easily evaluate the platform without creating an account from scratch, please use:
* **Passenger Account:** `passenger@test.com` | Password: `Password123!`
* **Rider (Driver) Account:** `rider@test.com` | Password: `Password123!`
* *(Use Interswitch sandbox test cards for evaluating the wallet funding feature)*

### 🎯 Judging Criteria Alignment
- **Problem Solved:** RidePay directly tackles the friction, safety risks, and delays of cash-based transactions in informal transit sectors.
- **Technical Execution:** Successfully integrated **Interswitch APIs** for secure wallet top-ups and banking operations. Backend built on Django with ASGI Channels for WebSockets; Frontend built on Next.js.
- **User Experience:** Features an intuitive "Scan-to-Pay" QR code flow for passengers and an easy-to-read, instant-feedback earnings dashboard for drivers.
- **Innovation:** Brings instant, verifiable digital trust to everyday commuting with real-time WebSocket notifications—so drivers know they are paid instantly without needing to refresh.
- **Completeness:** A fully working MVP complete with role-based auth, Interswitch wallet funding, real-time transfers, and driver cash-outs.

---

## Overview

RidePay solves a critical challenge in ride-sharing ecosystems: **How do you create frictionless, trustworthy payments between drivers and passengers in real-time?**

In many developing markets, ride-sharing services struggle with:

- 💸 Cash-based transactions that are inefficient and unsafe
- 🔗 No unified payment infrastructure connecting riders and passengers
- 📱 Lack of transparent, verifiable transaction history
- 🏦 Difficulty for drivers to withdraw earnings seamlessly

**RidePay** is a modern payment platform that eliminates these friction points by:

- **For Passengers**: A digital wallet to fund rides with a single tap, with full transaction transparency and hassle-free payments
- **For Riders (Drivers)**: A powerful earnings dashboard to track income, manage ratings, and cash out to their bank accounts instantly
- **For Operators**: Admin controls to manage fares, monitor transactions in real-time, and ensure platform integrity through WebSocket-powered live updates
- **For Security**: All transactions are backed by Interswitch's robust financial infrastructure, ensuring every payment is verified and reversible

---

## Key Features

✨ **Digital Wallet System**

- Instant wallet top-ups via Interswitch payment gateway
- Real-time balance updates across all devices
- Transaction history with detailed breakdowns

🚕 **Rider Management**

- QR code-based identification system for quick passenger recognition
- Unique short codes for easy reference in customer service
- Earnings dashboard with daily/weekly/monthly analytics
- One-click cash-out to registered bank accounts
- Rider approval workflow for platform security

👤 **Passenger Experience**

- Quick account setup with email verification
- Browse active riders with ratings and availability
- Secure payment directly from wallet or top-up before ride
- Easy profile management and payment method management

📊 **Admin Dashboard**

- Real-time transaction monitoring via WebSocket
- Fare management and dynamic pricing controls
- User approval and compliance workflows
- Transaction dispute resolution tools

🔒 **Security & Verification**

- Email-based account activation
- Role-based access control (Passenger/Rider/Admin)
- Bank Verification Number (BVN) and account validation via Interswitch
- Transaction reference tracking for audits

🔄 **Real-Time Updates**

- WebSocket integration for live transaction status
- Instant wallet balance synchronization
- Real-time ride status updates for passengers and drivers

---

## How to Get Started

### Prerequisites

- Python 3.10+ (Backend)
- Node.js 18+ (Frontend)
- PostgreSQL or SQLite (Database)
- Interswitch API credentials (for payment processing)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/RidePay.git
   cd RidePay
   ```

2. **Backend Setup**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   # or
   pnpm install
   npm run dev
   ```

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in both backend and frontend
   - Add your Interswitch API credentials
   - Set up email service configuration

5. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - Admin Dashboard: `http://localhost:3000/admin`

---

## Testing the Platform

### As a Passenger:

1. Sign up with your email
2. Verify your email address
3. Fund your wallet via the payment gateway
4. Browse available riders and book a ride
5. Pay from your wallet and rate the driver

### As a Rider:

1. Sign up and complete the rider approval process
2. Verify your bank account for cash-out
3. Go online and start accepting passenger requests
4. Track earnings in your dashboard
5. Cash out your daily earnings anytime

### As an Admin:

1. Access the admin dashboard
2. Monitor all transactions in real-time
3. Manage system-wide fare settings
4. Review and approve new rider applications
5. Handle transaction disputes and refunds

---

## Tech Stack

| Component           | Technology                                              |
| ------------------- | ------------------------------------------------------- |
| **Frontend**        | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand |
| **Backend**         | Django 6.0, Django REST Framework, Daphne (ASGI)        |
| **Real-Time**       | WebSocket (Django Channels)                             |
| **Database**        | PostgreSQL / SQLite                                     |
| **Payment Gateway** | Interswitch APIs (BVN, Bank Transfer, Account Lookup)   |
| **Authentication**  | JWT + Djoser (Django)                                   |
| **Deployment**      | Vercel (Frontend), Heroku/Railway (Backend)             |

---

## Interswitch Integration

RidePay leverages Interswitch's powerful APIs for secure financial operations:

- **BVN Verification API** - Verify rider identity and bank details
- **Bank Transfer API** - Enable instant cash-out to driver banks
- **Account Lookup** - Validate bank accounts before processing transfers
- **Payment Gateway** - Secure wallet top-ups with multiple payment methods

All transactions are processed in test mode during development and can be switched to production with proper credentials.

---

## Problem Solved

✅ **For Passengers**: Safe, instant digital payments without carrying cash  
✅ **For Riders**: Transparent earnings tracking with instant cash-out capability  
✅ **For Operators**: Complete visibility and control over the payment ecosystem  
✅ **For Trust**: All transactions backed by verified financial infrastructure

---

## Project Structure

```
RidePay/
├── backend/
│   ├── users/              # User authentication & profiles
│   ├── transactions/       # Payment & wallet logic
│   ├── RidePay/           # Django settings & configuration
│   └── manage.py          # Django CLI
├── frontend/
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable UI components
│   ├── lib/              # API clients & utilities
│   └── public/           # Static assets
└── README.md
```

---

## Roadmap

- [ ] Mobile app versions (iOS/Android)
- [ ] Advanced surge pricing algorithms
- [ ] Driver insurance & protection programs
- [ ] In-app communication (chat/calling)
- [ ] Schedule rides in advance
- [ ] Corporate account management
- [ ] Multi-currency support

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the MIT License. See the `LICENSE` file for details.

---

## Support

Have questions or issues?

- 📧 Email: support@rideay.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/yourusername/RidePay/issues)
- 💬 Join our community discussions

---

## Acknowledgments

Built with love using:

- [Django](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js](https://nextjs.org/) & [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Interswitch](https://www.interswitchgroup.com/) for payment infrastructure

---

**Made with ❤️ by the RidePay team**
