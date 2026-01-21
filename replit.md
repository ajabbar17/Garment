# Aesthetic Online Garment Store

## Overview

This is a full-stack e-commerce prototype for an online garment store called "Aesthetique" (also branded as "ARCHIVE"). The application allows users to browse products, manage a shopping cart, and complete a checkout process. An admin panel provides product management and order viewing capabilities.

The project uses a hybrid architecture with both vanilla HTML/CSS/JavaScript pages and a React-based SPA structure, backed by a Node.js Express server with JSON file-based storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Dual rendering approach**: The project contains both vanilla HTML pages (`client/*.html` with `client/js/main.js` and `client/css/style.css`) and a React SPA (`client/src/`) using Vite as the build tool
- **React stack**: React with TypeScript, wouter for routing, TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives and Tailwind CSS for styling
- **Design system**: Uses CSS custom properties for theming with a dark, minimalist aesthetic (black background, white text, accent colors)

### Backend Architecture
- **Express 5**: Node.js server handling API routes and static file serving
- **Session management**: express-session with memorystore for cart and admin authentication state
- **API structure**: RESTful endpoints under `/api/` prefix for products, cart, orders, and admin operations
- **Data validation**: Zod schemas in `shared/schema.ts` for type-safe validation across frontend and backend

### Data Storage
- **Current implementation**: JSON file storage (`data.json`) with a custom `JsonStorage` class in `server/storage.ts`
- **Database preparation**: Drizzle ORM is configured with PostgreSQL support (`drizzle.config.ts`), but currently uses file-based storage. The schema supports products and orders with Zod validation
- **Session storage**: In-memory session store for development; connect-pg-simple is available for production PostgreSQL sessions

### Authentication
- **Admin authentication**: Simple username/password check (admin/admin123) stored in session
- **Session-based**: No JWT or external auth providers; relies on express-session cookies

### Key Design Decisions
1. **Hybrid frontend**: Maintains both vanilla JS pages for simple views and React infrastructure for potential future migration
2. **File-based storage**: Chose JSON file storage for simplicity in academic/prototype context, with database-ready Drizzle schemas
3. **Shared schemas**: Zod schemas in `shared/` directory enable type safety and validation on both client and server
4. **Component library**: shadcn/ui provides accessible, customizable components without heavy dependencies

## External Dependencies

### Core Technologies
- **Runtime**: Node.js 18+
- **Build tools**: Vite for frontend, esbuild for server bundling, tsx for TypeScript execution

### Database & ORM
- **Drizzle ORM**: Configured for PostgreSQL but not actively used; storage abstraction allows easy switching
- **PostgreSQL**: Prepared with `connect-pg-simple` for production session storage

### Frontend Libraries
- **React ecosystem**: React 18, React DOM, wouter (routing), TanStack Query (data fetching)
- **UI framework**: Tailwind CSS, Radix UI primitives, class-variance-authority, clsx

### Backend Libraries
- **Express plugins**: express-session, memorystore, body parsers
- **Validation**: Zod with drizzle-zod integration

### Development Tools
- **TypeScript**: Strict mode enabled with path aliases (@/, @shared/)
- **Replit plugins**: vite-plugin-runtime-error-modal, cartographer, dev-banner for development experience