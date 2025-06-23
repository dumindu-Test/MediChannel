# 🏥 Healthcare Management System - Supabase Setup Guide

This guide will help you set up Supabase with secure authentication for the Healthcare Management System.

## 🔐 Authentication Features

- **Secure Password Hashing**: Uses bcrypt for password protection
- **Role-based Access**: Patient, Doctor, and Admin roles  
- **Complete Signup Process**: Full registration with validation
- **Mock Authentication**: Works without Supabase for testing

## 📋 Prerequisites

1. A Supabase account (free tier works fine)
2. Node.js installed on your machine
3. This Healthcare Management System project

## 🚀 Setup Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `healthcare-management` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your location
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

### Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon, public - this is safe to use in frontend)

### Step 3: Configure Environment Variables

1. In your project root, create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Replace the placeholder values with your actual Supabase credentials
3. Save the file
4. Make sure `.env.local` is in your `.gitignore` file (it should be by default)

### Step 4: Run Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire content from `supabase-schema.sql` in your project
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema
5. This will create:
   - Users table with password hashing support
   - Appointments table
   - Doctor schedules table
   - Proper indexes and security policies
   - Sample data with hashed passwords

### Step 5: Test the Connection

1. Restart your development server: `npm run dev`
2. The application should now connect to your Supabase database
3. You can create new accounts using the signup form
4. Sample users with password "password" are already created for testing

## 🔑 User Authentication

### Default Test Accounts
All sample accounts use the password: **`password`**

**Doctors:**
- `dr.perera@hospital.lk` (Cardiology)
- `dr.fernando@hospital.lk` (Neurology)  
- `dr.priya@hospital.lk` (Pediatrics)
- `dr.nuwan@hospital.lk` (Orthopedics)

**Patients:**
- `john@email.com`
- `mary@email.com`

**Admin:**
- `admin@hospital.lk`

### Password Requirements
When creating new accounts:
- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number

### Creating New Accounts
1. Click "Create New Account" on the login screen
2. Fill in your information based on your role:
   - **Patients**: Name, email, password, phone number (required), date of birth, address
   - **Doctors**: Name, email, password, specialization (required), hospital (required), consultation fees, experience
   - **Admin**: Name, email, password
3. Your password will be securely hashed and stored

## 🔒 Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **Role-based Access**: Users can only access their own data and relevant information
- **Input Validation**: Email, password, and other fields are validated before saving

## 📊 Database Structure

### Users Table
- `id`: UUID primary key
- `name`: User's full name
- `email`: Unique email address  
- `password_hash`: Securely hashed password
- `role`: patient | doctor | admin
- Doctor-specific: specialization, hospital, consultation_fee, experience, rating
- Patient-specific: phone, date_of_birth, address

### Appointments Table
- Links patients to doctors
- Stores appointment details, symptoms, diagnosis
- Tracks appointment status and fees

### Doctor Schedules Table  
- Manages doctor availability
- Stores time slots as JSON
- Tracks booking status

## 🛠️ Troubleshooting

### Environment Variables Not Working
1. Make sure your `.env.local` file is in the project root
2. Restart your development server after adding environment variables
3. Check that variable names match exactly (including `NEXT_PUBLIC_` prefix)

### Database Connection Issues
1. Verify your Supabase project URL and API key are correct
2. Make sure your Supabase project is not paused
3. Check the Network tab in browser dev tools for failed requests

### Authentication Problems
1. Ensure the database schema has been run successfully
2. Check that sample users exist in the users table
3. Verify password hashing is working (passwords should be bcrypt hashes)

### RLS Policy Issues
1. Make sure Row Level Security is enabled
2. Check that the policies were created properly
3. Verify users have the correct role assignments

## 🎯 What's Next?

After setup, you can:
1. **Create User Accounts**: Use the signup form to register new users
2. **Book Appointments**: Patients can search for doctors and book appointments  
3. **Manage Schedules**: Doctors can set their availability
4. **Admin Dashboard**: Admins can view system statistics and manage users
5. **Extend Features**: Add more functionality as needed

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Review the Supabase dashboard for database errors
3. Ensure all environment variables are set correctly
4. Verify the database schema was applied successfully

Happy coding! 🎉