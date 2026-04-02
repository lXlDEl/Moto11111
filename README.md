# МотоМагазин - Motorcycle Store

A full-featured motorcycle e-commerce website with user authentication, persistent data, and admin features.

## Features

- **User Authentication**: Register and login system
- **Product Management**: View, search, sort, and filter motorcycles
- **Shopping Cart**: Add/remove items, persistent per user
- **Order System**: Place orders and view order history
- **Admin Panel**: Add and delete products (admin only)
- **Product Details**: Click on products for detailed view
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL, JWT Authentication
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: PostgreSQL with SERIAL auto-increment

## Installation

1. Install PostgreSQL (or use cloud service like ElephantSQL, Supabase)
2. Clone the repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set environment variables:
   ```bash
   export PG_USER=your_username
   export PG_HOST=localhost
   export PG_DATABASE=moto_store
   export PG_PASSWORD=your_password
   export PG_PORT=5432
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. Open http://localhost:3000 in your browser

## Default Admin Account

- Email: admin@moto.com
- Password: admin123

## Deployment

### To Render.com with PostgreSQL

1. Create PostgreSQL database (ElephantSQL, Supabase, or Render PostgreSQL)
2. Set environment variables in Render:
   - PG_USER
   - PG_HOST
   - PG_DATABASE
   - PG_PASSWORD
   - PG_PORT
3. Deploy as usual

### To Railway

Similar setup with PostgreSQL database.

## Database

The app connects to PostgreSQL and creates tables automatically on first run. Uses SERIAL for auto-increment IDs. Default products and admin user are inserted on initialization.

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/products` - Get all products
- `POST /api/products` - Add product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart
- `POST /api/checkout` - Place order
- `GET /api/orders` - Get user's orders

## Security

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- CORS enabled for cross-origin requests