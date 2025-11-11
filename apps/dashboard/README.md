# DocFlow Admin Dashboard

Internal management panel for DocFlow document management system.

## 🎯 Overview

A comprehensive admin dashboard built with Next.js 14, React, and Tailwind CSS for managing DocFlow's internal operations. This dashboard provides real-time monitoring, customer management, and system administration tools.

## ✨ Features

### 📊 **7 Core Modules**

1. **Real-time Activity Feed** - Live WebSocket feed of all system events
2. **Document Queue Manager** - Manage pending documents with bulk operations
3. **OCR Error Triage** - Review and fix OCR processing errors
4. **Customers** - Customer management with statistics
5. **Analytics & Reporting** - KPI metrics, charts, and trends
6. **Billing & Invoicing** - MRR tracking, churn analysis, invoices
7. **API Monitoring** - Health checks, latency, error monitoring

### 🔐 **Security & Authentication**

- JWT-based authentication
- Role-based access control (Admin, Super Admin)
- Module-level permissions
- Secure session management
- Middleware protection for all routes

### 🎨 **UI/UX Features**

- Modern, responsive design
- Dark/light mode support
- Real-time updates
- Interactive charts and visualizations
- Bulk operations with optimistic updates
- Export functionality (CSV, PDF)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd apps/dashboard
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

### Production Build

```bash
npm run build
npm start
```

## 👤 Demo Credentials

The dashboard includes demo authentication for testing:

- **Admin User**: `admin@docflow.fi` / `admin123`
- **Support Agent**: `support@docflow.fi` / `support123`

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: JWT with role-based permissions
- **Real-time**: WebSocket integration ready
- **State Management**: React hooks and context
- **Build**: Next.js App Router

### Project Structure

```
apps/dashboard/
├── app/
│   ├── globals.css          # Global styles with design tokens
│   ├── layout.tsx           # Root layout
│   ├── login/               # Authentication pages
│   └── page.tsx            # Main dashboard page
├── components/              # React components
│   ├── RealTimeActivity.tsx
│   ├── DocumentQueueManager.tsx
│   ├── OCRErrorTriage.tsx
│   ├── Customers.tsx
│   ├── Analytics.tsx
│   ├── Billing.tsx
│   └── APIMonitoring.tsx
├── lib/
│   └── auth.ts             # Authentication utilities
├── middleware.ts           # Route protection
└── package.json
```

## 📊 Module Details

### Real-time Activity Feed
- Live system event monitoring
- WebSocket connection with reconnection
- Filterable by activity type
- Connection status indicators
- Activity statistics and counts

### Document Queue Manager
- View all pending, processing, completed, and error documents
- Bulk operations (requeue, priority changes, delete)
- Sort by date, priority, or customer
- Document type and status tracking
- Queue statistics dashboard

### OCR Error Triage
- Centralized error handling interface
- Error categorization and priority levels
- Manual review and resolution workflow
- Retry mechanisms with retry count tracking
- Notes and assignment functionality

### Customer Management
- Customer database with full profiles
- Contact information and billing details
- Plan management and upgrade tracking
- Usage statistics and activity monitoring
- Direct communication tools

### Analytics & Reporting
- Real-time KPI monitoring
- Interactive charts and trends
- Data export functionality (CSV/PDF)
- Performance alerts and insights
- Top customer analysis

### Billing & Invoicing
- MRR tracking and breakdown
- Invoice management
- Payment transaction monitoring
- Churn rate analysis
- Revenue trend visualization

### API Monitoring
- Real-time service health monitoring
- Endpoint performance metrics
- Error rate tracking
- System uptime statistics
- Alert management system

## 🔒 Security Features

- **Authentication**: JWT token-based with secure storage
- **Authorization**: Role-based access control
- **Route Protection**: Middleware-secured all routes
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Secure error messages without PII
- **Session Management**: Automatic logout and session refresh

## 🎨 Design System

The dashboard uses a comprehensive design system with:

- **Colors**: CSS custom properties for theming
- **Components**: Reusable Tailwind component classes
- **Typography**: Consistent font scales and weights
- **Spacing**: Consistent spacing system
- **Shadows**: Subtle elevation system
- **Animations**: Smooth transitions and micro-interactions

## 📈 Performance

- **Next.js 14**: Latest optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image component
- **Bundle Analysis**: Optimized bundle sizes
- **Caching**: Strategic caching for static content

## 🧪 Testing

```bash
npm run lint          # ESLint checking
npm run type-check    # TypeScript type checking
```

## 📦 Deployment

### Environment Variables

Required for production:

```env
ADMIN_JWT_SECRET=your-super-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
```

### Deployment Options

- **Vercel**: Optimized for Next.js
- **Netlify**: Static hosting with serverless functions
- **Docker**: Container deployment
- **Fly.io**: App platform deployment

## 🔄 Real-time Features

The dashboard is designed for real-time operations:

- **WebSocket Integration**: Live activity feeds
- **Auto-refresh**: Configurable auto-refresh intervals
- **Optimistic Updates**: Immediate UI feedback
- **Connection Management**: Robust connection handling
- **Reconnection Logic**: Automatic reconnection with backoff

## 📱 Mobile Responsive

Fully responsive design supporting:

- **Desktop**: Full feature experience
- **Tablet**: Optimized layout adjustments
- **Mobile**: Touch-optimized interface
- **Cross-browser**: Modern browser support

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Customization

The dashboard is highly customizable:

- **Theme**: Modify CSS custom properties
- **Modules**: Add/remove dashboard modules
- **Permissions**: Adjust role-based access
- **Data Sources**: Connect to real APIs
- **Styling**: Extend Tailwind configuration

## 📋 Support

For technical support or questions:

- Check the logs for any errors
- Verify environment variables
- Ensure all dependencies are installed
- Review the authentication configuration

## 📄 License

Internal DocFlow Admin Dashboard - Not for external distribution.

---

**Built with ❤️ for DocFlow Internal Operations**