# Bhumitra CFE - Comprehensive Project Summary
---

## 1. Project Overview

**Bhumitra CFE** (Bhumitra Citizens For Environment) is a full-stack web application for a community environmental initiative. It provides an e-commerce and content management platform for eco-friendly products, blog posts, and user engagement with a hidden password-protected admin interface.

### Core Purpose
- Promote eco-friendly products (Bhumizyme enzyme cleaner, upcycled cloth bags, bioenzyme activator)
- Publish blog content about environmental initiatives
- Accept user registrations and feedback
- Manage all content through an admin dashboard

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19.1.0
- **Build Tool:** Create React App (react-scripts)
- **Styling:** Custom CSS + Bootstrap (grid classes)
- **Theme System:** Custom light/dark theme toggle
- **Environment Config:** .env via `REACT_APP_API_URL`

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5.1.0
- **Database:** PostgreSQL
- **Port:** 5000 (configurable via `PORT` env var)
- **Environment Config:** .env for database credentials

### Database
- **Type:** PostgreSQL
- **Name:** `details`
- **Tables:** 3 (deet, products, blogs)
- **Default Credentials:** postgres/nopostsql (localhost development)

---

## 3. Project Structure

```
bhumitra/
├── client/                       # React frontend
│   ├── public/
│   │   ├── carousel/            # Hero carousel images
│   │   ├── products/            # Product preview images
│   │   ├── team/                # Team member photos
│   │   ├── index.html           # Main HTML entry
│   │   ├── manifest.json        # PWA config
│   │   └── robots.txt           # SEO robots.txt
│   ├── src/
│   │   ├── App.js               # Main app routing & state (121 lines)
│   │   ├── App.css              # Main styles
│   │   ├── index.js             # React root mount
│   │   ├── index.css            # Global CSS
│   │   ├── themes.js            # Light/dark theme definitions
│   │   ├── reportWebVitals.js   # Performance metrics
│   │   └── components/
│   │       ├── AboutContact.js       # Home page with team & contact
│   │       ├── AdminDashboard.js     # Admin interface for CRUD
│   │       ├── Blog.js               # Magazine-style blog layout
│   │       ├── ImageCarousel.js      # Hero image slider
│   │       ├── ProductCatalog.js     # Product gallery with modal expand
│   │       ├── ProductCatalog.css    # Product styling
│   │       ├── register.js           # User registration form
│   │       ├── TeamMembers.js        # Team profiles
│   │       ├── TeamMembers.css       # Team styling
│   │       └── listUsers.js          # Admin user management table
│   ├── package.json
│   ├── .env                     # REACT_APP_API_URL
│   └── .gitignore              # Ignores node_modules, .env, build/
│
├── server/                       # Express backend
│   ├── db.js                    # PostgreSQL pool connection config (11 lines)
│   ├── index.js                 # Main API server (250+ lines)
│   ├── database.sql             # DB schema & table definitions
│   ├── .env                     # DB credentials & port
│   ├── .gitignore              # Ignores node_modules, .env
│   └── package.json            # Dependencies: cors, dotenv, express, pg
│
├── bhumitracfe/                 # Symlinked GitHub deploy context (folder)
├── index.js                     # Root entry (unused, legacy)
├── README.md                    # User-facing setup & hosting guide
└── SUMMARY.md                   # This file
```

---

## 4. Database Schema

### Table: `deet` (User Registrations)
```sql
CREATE TABLE deet(
    reg_id SERIAL PRIMARY KEY,
    name varchar(200) NOT NULL,
    email varchar(200) NOT NULL,
    mobile_no varchar(200) NOT NULL,
    feedback text,
    purchase varchar(500) NOT NULL
);
```
**Purpose:** Stores user registrations with interest in products/workshops

### Table: `products`
```sql
CREATE TABLE products(
    product_id SERIAL PRIMARY KEY,
    name varchar(200) NOT NULL,
    price varchar(100) NOT NULL,
    description text NOT NULL,
    image text
);
```
**Purpose:** E-commerce product listings (Bhumizyme, cloth bags, activator)

### Table: `blogs`
```sql
CREATE TABLE blogs(
    blog_id SERIAL PRIMARY KEY,
    title varchar(255) NOT NULL,
    excerpt text,
    image text,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);
```
**Purpose:** Blog posts with optional featured images and timestamps

---

## 5. Components & Features

### 5.1 Frontend Components

#### **App.js** (App Root)
**Location:** `client/src/App.js`  
**Lines:** 121  
**Key Features:**
- Route-based page switching (about, register, products, blog, admin, list)
- Centralized auth modal for `/admin` and `/list` access
- Dark/light theme toggle with CSS variables
- Fetches blogs & products from backend API on mount
- Admin password hardcoded: `bhumitra`
- Normalizes DB field names for component compatibility

**State Management:**
- `currentPage`: current view (about, register, products, blog, admin, list)
- `isDarkMode`: boolean for theme state
- `blogs`: array of blog objects
- `products`: array of product objects
- `isAuthenticated`: admin access flag
- `adminPassword`: form input for auth modal

#### **AboutContact.js**
**Location:** `client/src/components/AboutContact.js`  
**Key Features:**
- Hero section with org name & description
- 3-column feature highlight (Environmental Impact, Products, Community)
- TeamMembers sub-component
- Contact info card (address, email)
- Theme-aware styling

#### **register.js**
**Location:** `client/src/components/register.js`  
**Key Features:**
- Form validation (name min 2 chars, email format, mobile 10 digits)
- Dropdown for purchase interest: Bhumizyme, Cloth Bags, Activator, Workshop, NA, Other
- Optional "other_purchase" text field if "Other" selected
- Textarea for feedback
- POST to `/register` endpoint
- Success/error messaging
- Theme-aware form styling

#### **ProductCatalog.js**
**Location:** `client/src/components/ProductCatalog.js`  
**Key Features:**
- Responsive 3-column grid (mobile: 1 col, tablet: 2 col, desktop: 3 col)
- Product cards with image, name, description, price tag
- Click image to expand modal (40%+ of viewport)
- CSS flexbox layout
- Fallback default products if API unavailable
- Theme colors for cards & borders

#### **Blog.js**
**Location:** `client/src/components/Blog.js`  
**Key Features:**
- Magazine-style 3-column layout
- Center post (largest, most recent) with full content
- Left & right sidebar posts (2 each, titles + excerpts)
- Older posts archive below (3-column grid)
- Formatted date display
- Theme-aware card styling

#### **AdminDashboard.js**
**Location:** `client/src/components/AdminDashboard.js`  
**Key Features:**
- **Blog Management:** Create, edit, delete blog posts
- **Product Management:** Create, edit, delete products
- **Image Upload:** File upload from PC or image URL
- **Base64 Images:** Converts uploaded files to base64 for DB storage
- **User Management:** Lists registered users via ListUsers sub-component
- API calls to `/blogs`, `/products` with full CRUD
- Success/error status messaging
- Form validation (title+content required for blogs, name+price+description for products)

#### **listUsers.js**
**Location:** `client/src/components/listUsers.js`  
**Key Features:**
- Fetches users from `/users` API
- Table display of registrations
- Edit user (feedback/purchase dropdown)
- Delete user with confirmation
- Admin-only access (behind `/admin` password gate)

#### **ImageCarousel.js**
**Location:** `client/src/components/ImageCarousel.js`  
**Key Features:**
- Hero carousel with fade-in/out transitions
- Images from `/public/carousel/` folder
- Auto-rotate with interval timer
- Navigation dots for manual control

#### **TeamMembers.js**
**Location:** `client/src/components/TeamMembers.js`  
**Key Features:**
- Grid display of team member cards (4 per row on desktop)
- Profile image, name, role, achievements
- Responsive design with proper spacing
- Theme-aware styling for cards

### 5.2 Backend API Endpoints

**Base URL:** http://localhost:5000

#### User Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/register` | Register new user | None |
| GET | `/users` | List all users | Admin only |
| PUT | `/users/:id` | Update user feedback/purchase | Admin only |
| DELETE | `/users/:id` | Delete user record | Admin only |

**Request/Response Example (Register):**
```javascript
POST /register
Body: {
  name: "John Doe",
  email: "john@example.com",
  mobile_no: "9876543210",
  feedback: "Love your products!",
  purchase: "Bhumizyme"
}
Response: { reg_id: 1, name: "John Doe", ... }
```

#### Product Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/products` | List all products |
| POST | `/products` | Create new product (admin) |
| PUT | `/products/:id` | Update product (admin) |
| DELETE | `/products/:id` | Delete product (admin) |

**Request/Response Example (Create):**
```javascript
POST /products
Body: {
  name: "Bhumizyme",
  price: "₹199/L",
  description: "Bio-enzyme cleaner",
  image: "base64(...)" or "https://..."
}
Response: { product_id: 1, name: "Bhumizyme", ... }
```

#### Blog Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/blogs` | List all blogs (ordered by created_at DESC) |
| POST | `/blogs` | Create new blog (admin) |
| PUT | `/blogs/:id` | Update blog (admin) |
| DELETE | `/blogs/:id` | Delete blog (admin) |

**Request/Response Example (Create):**
```javascript
POST /blogs
Body: {
  title: "Eco-friendly tips",
  excerpt: "Short summary",
  image: "base64(...)" or "https://...",
  content: "Full blog text..."
}
Response: { blog_id: 1, created_at: "2026-04-08T...", ... }
```

#### Utility Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/test-db` | Test database connection |

---

## 6. Environment Configuration

### Server .env (`server/.env`)
```
DB_USER=postgres
DB_PASSWORD=nopostsql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=details
PORT=5000
```

### Client .env (`client/.env`)
```
REACT_APP_API_URL=http://localhost:5000
```

### Configuration Files
- `server/db.js`: Reads `DB_*` vars, creates PostgreSQL pool
- `server/index.js`: Reads `PORT` var, loads dotenv
- `client/src/App.js`: Reads `REACT_APP_API_URL` var for API calls

---

## 7. Current Features Present

### ✅ Implemented Features

**Public Pages:**
- ✅ Home/About page with org description & team members
- ✅ Product catalog with 3-column responsive grid
- ✅ Magazine-style blog with featured post center layout
- ✅ User registration form with validation & dropdown options
- ✅ Contact info card on home page

**Design/UX:**
- ✅ Light/dark theme toggle (global state)
- ✅ Responsive CSS grid layouts (mobile/tablet/desktop)
- ✅ Modal expansion for product images
- ✅ Theme-aware colors (nav, cards, text, borders)
- ✅ Form validation with error messages

**Admin Features:**
- ✅ Password-protected admin access (`/admin` route)
- ✅ Blog create/edit/delete with image upload
- ✅ Product create/edit/delete with image upload
- ✅ User list/edit/delete for registrations
- ✅ Success/error status messages
- ✅ Base64 file upload handling

**Backend/Database:**
- ✅ PostgreSQL integration with connection pooling
- ✅ Full CRUD APIs for users, products, blogs
- ✅ Environment-based configuration (.env)
- ✅ CORS enabled for frontend communication
- ✅ JSON payload handling (10MB limit for large images)
- ✅ Error handling & console logging

**Deployment Ready:**
- ✅ Gitignore for .env & node_modules
- ✅ README with setup & hosting instructions
- ✅ Database schema file (database.sql)
- ✅ Environment variable system for portability

---

## 8. Features Not Yet Implemented

### 🔲 Known Gaps & Future Enhancements

**Authentication & Security:**
- ❌ Proper authentication system (JWT, OAuth, etc.)
- ❌ Admin password should NOT be hardcoded in client
- ❌ Rate limiting on API endpoints
- ❌ Input sanitization for SQL injection prevention
- ❌ HTTPS enforcement in production

**Media Handling:**
- ❌ Cloud storage for images (S3, Supabase, Firebase)
- ❌ Image optimization/compression
- ❌ Image CDN for faster delivery
- ❌ File size limits enforcement on upload
- ❌ Image deletion when blog/product is deleted

**Database:**
- ❌ Database backups/migration scripts
- ❌ Indexes on frequently queried columns (email, created_at)
- ❌ Foreign key relationships between tables
- ❌ Soft deletes (archive instead of hard delete)
- ❌ Audit logs for admin actions

**Frontend Features:**
- ❌ Edit blog/product from admin (currently create-only in some flows)
- ❌ Search functionality for products/blogs
- ❌ Pagination for users/blogs lists
- ❌ Sorting options (by price, date, popularity)
- ❌ Wishlist/favorites feature
- ❌ Comments section on blog posts
- ❌ Email notifications on registration

**Backend Features:**
- ❌ Email service for registration confirmations
- ❌ Analytics/tracking API
- ❌ Caching layer (Redis)
- ❌ API request logging & monitoring
- ❌ Webhook notifications

**DevOps & Deployment:**
- ❌ Docker containerization
- ❌ CI/CD pipeline (GitHub Actions, etc.)
- ❌ Database migration tool (Flyway, Liquibase)
- ❌ Load balancing for production
- ❌ Automated testing (unit, integration, E2E)

---

## 9. Setup & Build Instructions

### Prerequisites
- **Node.js:** 18+ LTS
- **PostgreSQL:** 12+ (local or remote)
- **npm or yarn:** Latest

### Step 1: Clone/Access Repository
```bash
cd c:\Users\Kriti\OneDrive\Desktop\kriti\bhumitra
```

### Step 2: Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL (Windows: PostgreSQL installer from postgresql.org)
2. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE details;
   \q
   ```
3. Run schema:
   ```bash
   psql -U postgres -d details -f server/database.sql
   ```
4. Verify tables:
   ```bash
   psql -U postgres -d details -c "\dt"
   # Should show: deet, products, blogs
   ```

#### Option B: Using pgAdmin GUI
1. Right-click Databases → Create → Database → name: `details`
2. Open Query Tool on `details` DB
3. Copy & paste entire `server/database.sql` content
4. Execute query (F5)

### Step 3: Install Dependencies

**Backend:**
```bash
cd server
npm install
# Installs: cors, dotenv, express, pg
```

**Frontend:**
```bash
cd ../client
npm install
# Installs: react, react-dom, react-scripts, testing libs
```

### Step 4: Environment Configuration

Both `.env` files already exist with defaults. Update if needed:

**`server/.env`** (for local PostgreSQL)
```
DB_USER=postgres
DB_PASSWORD=nopostsql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=details
PORT=5000
```

**`client/.env`** (for local API)
```
REACT_APP_API_URL=http://localhost:5000
```

### Step 5: Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Output: "server has started on port 5000"
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
# Opens http://localhost:3000 automatically
```

### Step 6: Verify Installation

1. **Frontend loads:** http://localhost:3000 (should show Bhumitra home page)
2. **API responds:** http://localhost:5000/test-db (should return "Database connection successful")
3. **Products load:** Check "Our Products" page (should display 3 default products)
4. **Blogs load:** Check "Blog" page (should display 3 default blog posts)
5. **Admin access:** Visit http://localhost:3000/admin → Enter password `bhumitra`

### Step 7: Run Build

**Production frontend build:**
```bash
cd client
npm run build
# Creates optimized build/ folder
```

---

## 10. Database Migrations & Connections

### Current Setup
- **Database:** PostgreSQL `details` on localhost:5432
- **Pool:** pg.Pool with max 10 connections (default)
- **Connection:** Credentials from `server/.env`

### Migration Path: Local → Hosted

#### For Vercel (Frontend) + Render (Backend) + Supabase (Database):

**1. Supabase Setup:**
- Create account at supabase.com
- Create new project (PostgreSQL-backed)
- Run `server/database.sql` in Supabase SQL editor
- Copy connection string from project settings

**2. Update `server/.env` for Supabase:**
```
DB_USER=postgres
DB_PASSWORD=<your-supabase-password>
DB_HOST=<your-project>.postgres.supabase.co
DB_PORT=5432
DB_NAME=postgres
```

**3. Deploy Backend to Render:**
- Push code to GitHub
- Create Render service (Node.js)
- Set environment variables (copy from `.env`)
- Deploy from GitHub

**4. Deploy Frontend to Vercel:**
- Push code to GitHub
- Create Vercel project from repo
- Set `REACT_APP_API_URL` to your Render backend URL
- Deploy

**5. Update Frontend API URL:**
In `client/.env` or Vercel env vars:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Alternative: Railway Single-Click Deployment
- Railway supports full-stack deployment (Postgres + Node in one project)
- More seamless DB ↔ backend connection
- Set environment variables via Railway dashboard

### Database Backup & Recovery
```bash
# Backup
pg_dump -U postgres -d details > backup.sql

# Restore
psql -U postgres -d details < backup.sql
```

---

## 11. Deployment Checklist

### Pre-deployment
- [ ] Remove hardcoded admin password from client code (move to backend JWT)
- [ ] Set up environment variables for production
- [ ] Test all API endpoints with production database
- [ ] Enable HTTPS on backend
- [ ] Set up image storage (S3, Supabase Storage, etc.)
- [ ] Review CORS settings for production domains
- [ ] Add database connection limits & connection pooling config
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Run frontend build test (`npm run build`)
- [ ] Test on slower network conditions

### Frontend (Vercel/Netlify)
- [ ] Build successful locally
- [ ] All API URLs use environment variables
- [ ] .env files not committed to Git
- [ ] Auto-deploy from main branch configured

### Backend (Render/Railway/Heroku)
- [ ] All dependencies in `package.json`
- [ ] `npm start` command works
- [ ] Database migrations automated (via seed script or manual)
- [ ] Health check endpoint (`/test-db`) accessible
- [ ] Error handling for database failures
- [ ] Logging configuration set up

### Database (Supabase/Railway/AWS RDS)
- [ ] Tables created from schema file
- [ ] Indexes on `blogs.created_at`, `products.product_id` for performance
- [ ] Regular backups configured
- [ ] Connection pooling enabled
- [ ] Firewall rules allow backend IP only

### Post-deployment
- [ ] Test all user flows end-to-end
- [ ] Verify product upload/display
- [ ] Verify blog publish/display
- [ ] Test admin login with new password
- [ ] Monitor error logs for first 24 hours
- [ ] Set up uptime monitoring (Pingdom, Datadog, etc.)

---

## 12. Project Statistics

| Metric | Count |
|--------|-------|
| React Components | 9 |
| Backend Endpoints | 13 |
| Database Tables | 3 |
| Forms | 2 (register, admin) |
| Pages/Routes | 6 |
| CSS Files | 3 |
| Total Dependencies | 10 (server) + 8 (client) |
| Lines of Code (App.js) | 121 |
| Lines of Code (index.js) | 250+ |
| Database Columns | 15 |

---

## 13. Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `client/src/App.js` | App root & routing | ✅ Complete |
| `server/index.js` | API server | ✅ Complete |
| `server/db.js` | DB connection | ✅ Complete |
| `server/database.sql` | Schema | ✅ Complete |
| `client/.env` | Frontend config | ✅ Complete |
| `server/.env` | Backend config | ✅ Complete |
| `README.md` | User docs | ✅ Complete |
| `.gitignore` | Both repos | ✅ Complete |
| `package.json` | Dependencies | ✅ Complete |

---

## 14. Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| Frontend won't connect to API | Check `REACT_APP_API_URL` matches backend port (5000) |
| Database connection error | Verify PostgreSQL running, credentials in `.env`, database `details` exists |
| Admin password not working | Password is `bhumitra` hardcoded in App.js |
| Images not uploading | Check 10MB file size limit in server (express.json limit) |
| Build fails on client | Run `rm -rf node_modules && npm install` |
| Port 5000 in use | Change `PORT` in `server/.env` or kill process using port |
| Blog/product not saving | Check network tab for API errors, verify database tables exist |

---

## 15. Contact & Maintenance

**Organization:** Bhumitra CFE  
**Email:** bhumitracfe@gmail.com  
**Address:** Noida sector-62, 201301  

**Repository:** https://github.com/kritic2911/bhumitracfe  
**Last Updated:** April 8, 2026  
**Maintained By:** Development Team

---

## 16. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | April 8, 2026 | Initial full-stack implementation with DB persistence |
| 0.9.0 | April 4, 2026 | Admin dashboard & blog/product features |
| 0.5.0 | Earlier | Basic React layout & components |

---

**End of Summary**
