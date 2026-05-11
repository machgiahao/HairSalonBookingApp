-- =====================================================
-- Hair Salon Booking App - Database Initialization
-- Run this script to create all tables (IN CORRECT ORDER)
-- =====================================================

-- Enable UUID extension
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION "uuid-ossp";

-- =====================================================
-- STEP 1: BASE TABLES (no dependencies)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Users" (
    "userID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "role" VARCHAR(50) NOT NULL DEFAULT 'Customer',
    "password" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "email" VARCHAR(255) UNIQUE,
    "email_verified" BOOLEAN DEFAULT FALSE,
    "refreshToken" TEXT,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Guest" (
    "guestID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fullName" VARCHAR(100),
    "phoneNumber" VARCHAR(20),
    "email" VARCHAR(255),
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Service" (
    "serviceID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "serviceName" VARCHAR(100) NOT NULL,
    "img" TEXT,
    "type" VARCHAR(50),
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER DEFAULT 30,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "WorkShift" (
    "workShiftID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shiftName" VARCHAR(50) NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "shiftDay" VARCHAR(20),
    "deleted" BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- STEP 2: ROLE TABLES (depend on Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Customer" (
    "customerID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fullName" VARCHAR(100),
    "avatar" TEXT,
    "dob" DATE,
    "gender" VARCHAR(20),
    "loyaltyPoints" INTEGER DEFAULT 0,
    "userID" UUID REFERENCES "Users"("userID") ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Staff" (
    "staffID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fullName" VARCHAR(100),
    "avatar" TEXT,
    "dob" DATE,
    "gender" VARCHAR(20),
    "address" TEXT,
    "hireDate" DATE,
    "userID" UUID REFERENCES "Users"("userID") ON DELETE CASCADE,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Stylist" (
    "stylistID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fullName" VARCHAR(100),
    "avatar" TEXT,
    "dob" DATE,
    "gender" VARCHAR(20),
    "address" TEXT,
    "level" VARCHAR(50),
    "certificateURL" TEXT,
    "hireDate" DATE,
    "userID" UUID REFERENCES "Users"("userID") ON DELETE CASCADE,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Manager" (
    "managerID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fullName" VARCHAR(100),
    "avatar" TEXT,
    "dob" DATE,
    "gender" VARCHAR(20),
    "address" TEXT,
    "userID" UUID REFERENCES "Users"("userID") ON DELETE CASCADE,
    "deleted" BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- STEP 3: INTERMEDIATE TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS "StylistWorkShift" (
    "stylistWorkShiftID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "stylistID" UUID REFERENCES "Stylist"("stylistID") ON DELETE CASCADE,
    "workShiftID" UUID REFERENCES "WorkShift"("workShiftID") ON DELETE CASCADE,
    "status" VARCHAR(20) DEFAULT 'Active',
    "deleted" BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- STEP 4: BOOKING & PAYMENT TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS "Booking" (
    "bookingID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "stylistID" UUID REFERENCES "Stylist"("stylistID") ON DELETE SET NULL,
    "stylistWorkShiftID" UUID REFERENCES "StylistWorkShift"("stylistWorkShiftID") ON DELETE SET NULL,
    "guestID" UUID REFERENCES "Guest"("guestID") ON DELETE SET NULL,
    "customerID" UUID REFERENCES "Customer"("customerID") ON DELETE SET NULL,
    "status" VARCHAR(50) DEFAULT 'In-progress',
    "originalPrice" DECIMAL(10,2),
    "discountPrice" DECIMAL(10,2),
    "note" TEXT,
    "appointmentAt" DATE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "BookingDetail" (
    "bookingID" UUID REFERENCES "Booking"("bookingID") ON DELETE CASCADE,
    "serviceID" UUID REFERENCES "Service"("serviceID") ON DELETE CASCADE,
    "deleted" BOOLEAN DEFAULT FALSE,
    PRIMARY KEY ("bookingID", "serviceID")
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "paymentID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bookingID" UUID REFERENCES "Booking"("bookingID") ON DELETE CASCADE,
    "method" VARCHAR(50),
    "status" VARCHAR(50) DEFAULT 'unpaid',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- STEP 5: SALARY TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS "Salary" (
    "salaryID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "baseSalary" DECIMAL(10,2) DEFAULT 7000000,
    "totalSalary" DECIMAL(10,2),
    "receivedDate" DATE,
    "userID" UUID REFERENCES "Users"("userID") ON DELETE CASCADE,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "DailySalary" (
    "dailyID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "stylistID" UUID REFERENCES "Stylist"("stylistID") ON DELETE CASCADE,
    "upToDay" DATE,
    "salary_bonus" DECIMAL(10,2) DEFAULT 0,
    "deleted" BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- STEP 6: OTHER TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS "News" (
    "newsID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "type" VARCHAR(50),
    "title" VARCHAR(200),
    "img" TEXT,
    "content" TEXT,
    "managerID" UUID REFERENCES "Manager"("managerID") ON DELETE SET NULL,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Feedback" (
    "feedbackID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bookingID" UUID REFERENCES "Booking"("bookingID") ON DELETE CASCADE,
    "rating" INTEGER CHECK ("rating" >= 1 AND "rating" <= 5),
    "comment" TEXT,
    "feedbackDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- OTP REQUEST TABLE (for forgot password)
-- =====================================================
CREATE TABLE IF NOT EXISTS "OtpRequest" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userID" UUID REFERENCES "Users"("userID") ON DELETE CASCADE,
    "otpCode" VARCHAR(10) NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "used" BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_phone ON "Users"("phoneNumber");
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"("email");
CREATE INDEX IF NOT EXISTS idx_booking_status ON "Booking"("status");
CREATE INDEX IF NOT EXISTS idx_booking_date ON "Booking"("appointmentAt");
CREATE INDEX IF NOT EXISTS idx_booking_customer ON "Booking"("customerID");
CREATE INDEX IF NOT EXISTS idx_booking_stylist ON "Booking"("stylistID");
CREATE INDEX IF NOT EXISTS idx_dailysalary_date ON "DailySalary"("upToDay");

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample services
INSERT INTO "Service" ("serviceName", "type", "description", "price", "duration", "img") VALUES
('Haircut', 'Basic', 'Standard haircut with styling', 150000, 30, 'https://res.cloudinary.com/divjonxjz/image/upload/haircut.jpg'),
('Hair Coloring', 'Premium', 'Full hair coloring service', 500000, 120, 'https://res.cloudinary.com/divjonxjz/image/upload/coloring.jpg'),
('Hair Treatment', 'Basic', 'Deep conditioning treatment', 200000, 45, 'https://res.cloudinary.com/divjonxjz/image/upload/treatment.jpg'),
('Perm Hair', 'Premium', 'Permanent wave treatment', 450000, 150, 'https://res.cloudinary.com/divjonxjz/image/upload/perm.jpg'),
('Bridal Makeup', 'Premium', 'Complete bridal makeup package', 1200000, 180, 'https://res.cloudinary.com/divjonxjz/image/upload/bridal.jpg'),
('Shampoo & Blow Dry', 'Basic', 'Wash and blow dry styling', 100000, 40, 'https://res.cloudinary.com/divjonxjz/image/upload/blowdry.jpg');

-- Insert sample workshifts
INSERT INTO "WorkShift" ("shiftName", "startTime", "endTime", "shiftDay") VALUES
('Morning Shift', '08:00:00', '14:00:00', 'Monday'),
('Afternoon Shift', '14:00:00', '20:00:00', 'Monday'),
('Morning Shift', '08:00:00', '14:00:00', 'Tuesday'),
('Afternoon Shift', '14:00:00', '20:00:00', 'Tuesday'),
('Morning Shift', '08:00:00', '14:00:00', 'Wednesday'),
('Afternoon Shift', '14:00:00', '20:00:00', 'Wednesday'),
('Morning Shift', '08:00:00', '14:00:00', 'Thursday'),
('Afternoon Shift', '14:00:00', '20:00:00', 'Thursday'),
('Morning Shift', '08:00:00', '14:00:00', 'Friday'),
('Afternoon Shift', '14:00:00', '20:00:00', 'Friday'),
('Morning Shift', '08:00:00', '14:00:00', 'Saturday'),
('Afternoon Shift', '14:00:00', '20:00:00', 'Saturday'),
('Morning Shift', '08:00:00', '14:00:00', 'Sunday'),
('Afternoon Shift', '14:00:00', '20:00:00', 'Sunday');

-- Insert sample news
INSERT INTO "News" ("type", "title", "content", "img") VALUES
('Promotion', 'Summer Discount 20%', 'Get 20% off on all hair coloring services this summer!', 'https://res.cloudinary.com/divjonxjz/image/upload/promo1.jpg'),
('Event', 'Grand Opening', 'We are happy to announce our grand opening on 1st June!', 'https://res.cloudinary.com/divjonxjz/image/upload/event1.jpg'),
('New Service', 'New Keratin Treatment', 'Try our new keratin treatment for smooth, shiny hair!', 'https://res.cloudinary.com/divjonxjz/image/upload/new_service.jpg');

-- Display created tables
SELECT 'Database initialized successfully!' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;