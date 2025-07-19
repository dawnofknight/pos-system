# POS System

A modern Point of Sale (POS) system built with Next.js 15, React 19, and Tailwind CSS v4, featuring a fully themeable UI (dark/light mode), draft cart saving, and category/product management.

## Features
- **Theme Toggle:** Switch between dark and light mode with full UI consistency.
- **Product & Category Management:** Browse, search, and filter products by category.
- **Cart & Drafts:** Add/remove items, auto-save cart as draft, load/clear drafts.
- **Sales Processing:** Complete sales with tax and subtotal calculations.
- **Responsive UI:** Works on desktop and mobile.
- **Modern Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4 (with inline style theming), Prisma ORM.

## Code Structure
- `src/components/ui/`: All reusable UI components (Button, Input, Select, Card, Table, Modal, etc.) are theme-aware and use inline styles for dark/light mode.
- `src/contexts/ThemeContext.js`: Theme context and hook for toggling and persisting theme.
- `src/app/dashboard/sales/create/page.js`: Main POS sales page, including product grid, cart, and category filter.
- `prisma/schema.prisma`: Database schema for products, categories, sales, etc.
- `public/`: Static assets and icons.

## Theming Approach
- **No Tailwind dark: classes:** All theming is handled via React context and inline styles for maximum compatibility with Tailwind v4 and React 19.
- **No border conflicts:** All border styles use only longhand properties (`borderWidth`, `borderStyle`, `borderColor`) to avoid React 19 errors.

## Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up your database:**
   - Edit `prisma/schema.prisma` as needed.
   - Run migrations:
     ```bash
     npx prisma migrate dev
     ```
3. **Start the dev server:**
   ```bash
   npm run dev
   ```
4. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel
1. **Push your code to GitHub.**
2. **Go to [vercel.com](https://vercel.com) and import your repository.**
3. **Set environment variables:**
   - For example, `DATABASE_URL` for your production database.
4. **Vercel will auto-detect Next.js and deploy.**
5. **After deployment:**
   - Run your Prisma migrations on the production database (see Vercel docs for [Next.js + Prisma](https://vercel.com/guides/nextjs-prisma-postgres)).

## Notes
- **Theme system:** All UI components use the `useTheme` hook and inline styles for color, background, and border.
- **No border shorthand:** Never use `border` shorthand in style or className; always use longhand properties.
- **React 19 compatible:** No style property conflicts.

## License
MIT
# POS System

A modern Point of Sale (POS) system built with Next.js, Prisma ORM, and PostgreSQL. Features include user authentication, inventory management, sales processing, and comprehensive dashboard analytics.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Dashboard**: Real-time statistics and analytics
- **Inventory Management**: CRUD operations for items and categories
- **Sales Processing**: Complete sales workflow with cart functionality
- **Stock Management**: Automatic stock updates and low-stock alerts
- **Responsive Design**: Built with Tailwind CSS for mobile-first design
- **Modern UI**: Clean and intuitive user interface

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS + Custom SCSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Update the `.env` file with your database credentials and JWT secret:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/pos_system?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Default Users

After seeding the database, you can log in with:

- **Admin User**: `admin@pos.com` / `admin123`
- **Cashier User**: `cashier@pos.com` / `cashier123`

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── items/        # Items CRUD endpoints
│   │   ├── categories/   # Categories CRUD endpoints
│   │   ├── sales/        # Sales processing endpoints
│   │   └── dashboard/    # Dashboard statistics
│   ├── dashboard/        # Dashboard pages
│   │   ├── items/        # Items management
│   │   ├── categories/   # Categories management
│   │   └── sales/        # Sales management
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── AuthGuard.js    # Authentication guard
│   └── DashboardLayout.js # Dashboard layout
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── lib/               # Utility functions
│   ├── auth.js        # Authentication utilities
│   ├── middleware.js  # API middleware
│   └── prisma.js      # Prisma client
└── middleware.js      # Next.js middleware
```

## API Routes

### Authentication
- `POST /api/auth` - Login/Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get item by ID
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create new sale

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Features in Detail

### Authentication
- JWT tokens stored in HTTP-only cookies
- Role-based access control (Admin/Cashier)
- Protected routes with middleware

### Dashboard
- Real-time sales statistics
- Today's, weekly, and monthly sales totals
- Low stock alerts
- Recent sales history
- Top selling items

### Inventory Management
- Add, edit, and delete items
- Category management
- Stock level tracking
- Price management

### Sales Processing
- Interactive cart system
- Real-time stock validation
- Automatic stock updates
- Complete sales history

## Database Schema

The application uses the following main entities:

- **Users**: Authentication and user management
- **Categories**: Product categorization
- **Items**: Inventory items with stock and pricing
- **Sales**: Sales transactions
- **SaleItems**: Items within each sale transaction

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
