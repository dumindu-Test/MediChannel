-- Healthcare Management System Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (patients, doctors, admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    
    -- Doctor specific fields
    specialization VARCHAR(255),
    hospital VARCHAR(255),
    consultation_fee INTEGER,
    experience INTEGER,
    rating DECIMAL(3,2) DEFAULT 0.0,
    
    -- Patient specific fields
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    symptoms TEXT,
    diagnosis TEXT,
    prescription TEXT,
    consultation_fee INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor schedules table
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    time_slots JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique schedule per doctor per date
    UNIQUE(doctor_id, schedule_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_date ON doctor_schedules(schedule_date);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON doctor_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and all doctors (for booking appointments)
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can view all doctors" ON users FOR SELECT USING (role = 'doctor');
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Appointments policies
CREATE POLICY "Patients can view their own appointments" ON appointments FOR SELECT USING (auth.uid()::text = patient_id::text);
CREATE POLICY "Doctors can view their appointments" ON appointments FOR SELECT USING (auth.uid()::text = doctor_id::text);
CREATE POLICY "Patients can create appointments" ON appointments FOR INSERT WITH CHECK (auth.uid()::text = patient_id::text);
CREATE POLICY "Doctors can update their appointments" ON appointments FOR UPDATE USING (auth.uid()::text = doctor_id::text);

-- Doctor schedules policies
CREATE POLICY "Anyone can view doctor schedules" ON doctor_schedules FOR SELECT TO authenticated;
CREATE POLICY "Doctors can manage their own schedules" ON doctor_schedules FOR ALL USING (auth.uid()::text = doctor_id::text);

-- Insert sample data with hashed passwords (password: "password")
-- Note: In production, use a more secure default password
INSERT INTO users (id, name, email, password_hash, role, specialization, hospital, consultation_fee, experience, rating) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dr. Samantha Perera', 'dr.perera@hospital.lk', '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', 'doctor', 'Cardiology', 'National Hospital of Sri Lanka', 2500, 15, 4.8),
    ('22222222-2222-2222-2222-222222222222', 'Dr. Rohith Fernando', 'dr.fernando@hospital.lk', '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', 'doctor', 'Neurology', 'Colombo General Hospital', 3000, 20, 4.9),
    ('33333333-3333-3333-3333-333333333333', 'Dr. Priya Jayawardene', 'dr.priya@hospital.lk', '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', 'doctor', 'Pediatrics', 'Lady Ridgeway Hospital', 2000, 12, 4.7),
    ('44444444-4444-4444-4444-444444444444', 'Dr. Nuwan Silva', 'dr.nuwan@hospital.lk', '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', 'doctor', 'Orthopedics', 'National Hospital of Sri Lanka', 2800, 18, 4.6)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, password_hash, role, phone, date_of_birth, address) VALUES
    ('55555555-5555-5555-5555-555555555555', 'John Silva', 'john@email.com', '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', 'patient', '+94771234567', '1990-05-15', 'Colombo 03, Sri Lanka'),
    ('66666666-6666-6666-6666-666666666666', 'Mary Perera', 'mary@email.com', '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', 'patient', '+94772345678', '1985-08-22', 'Kandy, Sri Lanka')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, password_hash, role, hospital) VALUES
    ('77777777-7777-7777-7777-777777777777', 'Admin User', 'admin@hospital.lk', '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', 'admin', 'National Hospital of Sri Lanka')
ON CONFLICT (email) DO NOTHING;

-- Insert sample doctor schedules
INSERT INTO doctor_schedules (doctor_id, schedule_date, time_slots) VALUES
    ('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '1 day', 
     '[
        {"time": "09:00", "is_available": true, "is_booked": false},
        {"time": "09:30", "is_available": true, "is_booked": false},
        {"time": "10:00", "is_available": true, "is_booked": false},
        {"time": "10:30", "is_available": true, "is_booked": false},
        {"time": "14:00", "is_available": true, "is_booked": false},
        {"time": "14:30", "is_available": true, "is_booked": false},
        {"time": "15:00", "is_available": true, "is_booked": false},
        {"time": "15:30", "is_available": true, "is_booked": false}
     ]'::jsonb),
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '1 day',
     '[
        {"time": "08:00", "is_available": true, "is_booked": false},
        {"time": "08:30", "is_available": true, "is_booked": false},
        {"time": "09:00", "is_available": true, "is_booked": false},
        {"time": "11:00", "is_available": true, "is_booked": false},
        {"time": "11:30", "is_available": true, "is_booked": false},
        {"time": "16:00", "is_available": true, "is_booked": false},
        {"time": "16:30", "is_available": true, "is_booked": false},
        {"time": "17:00", "is_available": true, "is_booked": false}
     ]'::jsonb)
ON CONFLICT (doctor_id, schedule_date) DO NOTHING;