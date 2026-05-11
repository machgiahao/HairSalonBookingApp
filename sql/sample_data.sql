-- =====================================================
-- Sample Data for Testing
-- Run this after init_database.sql
-- =====================================================

-- NOTE: Password is hashed using bcrypt for '123456'
-- The hash below corresponds to plaintext '123456'
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- =====================================================
-- SAMPLE USERS
-- =====================================================
INSERT INTO "Users" ("userID", "role", "password", "phoneNumber", "email", "email_verified") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345678', 'manager@hairsalon.com', TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Stylist', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345679', 'stylist1@hairsalon.com', TRUE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Stylist', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345680', 'stylist2@hairsalon.com', TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Staff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345681', 'staff@hairsalon.com', TRUE),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Customer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345682', 'customer1@gmail.com', TRUE),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Customer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345683', 'customer2@gmail.com', TRUE);

-- =====================================================
-- SAMPLE MANAGER
-- =====================================================
INSERT INTO "Manager" ("managerID", "fullName", "avatar", "dob", "gender", "address", "userID") VALUES
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Manager', 'https://res.cloudinary.com/divjonxjz/image/upload/manager1.jpg', '1990-01-01', 'Male', '123 Main Street, HCMC', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- =====================================================
-- SAMPLE STYLISTS
-- =====================================================
INSERT INTO "Stylist" ("stylistID", "fullName", "avatar", "dob", "gender", "address", "level", "hireDate", "userID") VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Nguyen Van A', 'https://res.cloudinary.com/divjonxjz/image/upload/stylist1.jpg', '1995-03-15', 'Male', '456 Oak Street, HCMC', 'Senior', '2020-06-01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Tran Thi B', 'https://res.cloudinary.com/divjonxjz/image/upload/stylist2.jpg', '1998-07-20', 'Female', '789 Pine Street, HCMC', 'Junior', '2022-01-15', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33');

-- =====================================================
-- SAMPLE STAFF
-- =====================================================
INSERT INTO "Staff" ("staffID", "fullName", "avatar", "dob", "gender", "address", "hireDate", "userID") VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Le Van C', 'https://res.cloudinary.com/divjonxjz/image/upload/staff1.jpg', '1992-11-05', 'Male', '321 Elm Street, HCMC', '2021-03-10', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44');

-- =====================================================
-- SAMPLE CUSTOMERS
-- =====================================================
INSERT INTO "Customer" ("customerID", "fullName", "avatar", "dob", "gender", "loyaltyPoints", "userID") VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Pham Van D', 'https://res.cloudinary.com/divjonxjz/image/upload/customer1.jpg', '1995-05-10', 'Male', 1500, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Nguyen Thi E', 'https://res.cloudinary.com/divjonxjz/image/upload/customer2.jpg', '1998-08-25', 'Female', 500, 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66');

-- =====================================================
-- SAMPLE GUEST
-- =====================================================
INSERT INTO "Guest" ("fullName", "phoneNumber", "email") VALUES
('Guest One', '0987654321', 'guest1@mail.com'),
('Guest Two', '0987654322', 'guest2@mail.com');

-- =====================================================
-- SAMPLE STYLIST WORKSHIFTS
-- =====================================================
-- Stylist 1 - Morning shift (Mon, Wed, Fri)
INSERT INTO "StylistWorkShift" ("stylistID", "workShiftID", "status")
SELECT 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', "workShiftID", 'Active'
FROM "WorkShift"
WHERE ("shiftName" = 'Morning Shift' AND "shiftDay" IN ('Monday', 'Wednesday', 'Friday'));

-- Stylist 1 - Afternoon shift (Tue, Thu, Sat)
INSERT INTO "StylistWorkShift" ("stylistID", "workShiftID", "status")
SELECT 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', "workShiftID", 'Active'
FROM "WorkShift"
WHERE ("shiftName" = 'Afternoon Shift' AND "shiftDay" IN ('Tuesday', 'Thursday', 'Saturday'));

-- Stylist 2 - Morning shift (Tue, Thu, Sat, Sun)
INSERT INTO "StylistWorkShift" ("stylistID", "workShiftID", "status")
SELECT 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', "workShiftID", 'Active'
FROM "WorkShift"
WHERE ("shiftName" = 'Morning Shift' AND "shiftDay" IN ('Tuesday', 'Thursday', 'Saturday', 'Sunday'));

-- Stylist 2 - Afternoon shift (Mon, Wed, Fri, Sat)
INSERT INTO "StylistWorkShift" ("stylistID", "workShiftID", "status")
SELECT 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', "workShiftID", 'Active'
FROM "WorkShift"
WHERE ("shiftName" = 'Afternoon Shift' AND "shiftDay" IN ('Monday', 'Wednesday', 'Friday', 'Saturday'));

-- =====================================================
-- SAMPLE BOOKINGS (Use auto-generated UUID)
-- =====================================================
-- First get some stylist workshift IDs
SELECT "stylistWorkShiftID" INTO TEMP TABLE sw_ids FROM "StylistWorkShift" LIMIT 5;

INSERT INTO "Booking" ("stylistID", "stylistWorkShiftID", "customerID", "status", "originalPrice", "discountPrice", "note", "appointmentAt")
SELECT
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    (SELECT "stylistWorkShiftID" FROM "StylistWorkShift" WHERE "stylistID" = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' LIMIT 1),
    'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Completed',
    200000,
    200000,
    'Regular haircut',
    '2024-11-01';

INSERT INTO "Booking" ("stylistID", "stylistWorkShiftID", "customerID", "status", "originalPrice", "discountPrice", "note", "appointmentAt")
SELECT
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    (SELECT "stylistWorkShiftID" FROM "StylistWorkShift" WHERE "stylistID" = 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' LIMIT 1),
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'Completed',
    650000,
    600000,
    'Hair coloring + treatment',
    '2024-11-05';

INSERT INTO "Booking" ("stylistID", "stylistWorkShiftID", "customerID", "status", "originalPrice", "discountPrice", "note", "appointmentAt")
SELECT
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    (SELECT "stylistWorkShiftID" FROM "StylistWorkShift" WHERE "stylistID" = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' LIMIT 1 OFFSET 1),
    'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'In-progress',
    150000,
    150000,
    'Just a trim',
    '2024-11-10';

-- =====================================================
-- SAMPLE BOOKING DETAILS
-- =====================================================
-- Get booking IDs
INSERT INTO "BookingDetail" ("bookingID", "serviceID")
SELECT b."bookingID", s."serviceID"
FROM "Booking" b
CROSS JOIN (SELECT "serviceID" FROM "Service" WHERE "serviceName" = 'Haircut') s
WHERE b."note" = 'Regular haircut';

INSERT INTO "BookingDetail" ("bookingID", "serviceID")
SELECT b."bookingID", s."serviceID"
FROM "Booking" b
CROSS JOIN (SELECT "serviceID" FROM "Service" WHERE "serviceName" = 'Hair Coloring') s
WHERE b."note" = 'Hair coloring + treatment';

INSERT INTO "BookingDetail" ("bookingID", "serviceID")
SELECT b."bookingID", s."serviceID"
FROM "Booking" b
CROSS JOIN (SELECT "serviceID" FROM "Service" WHERE "serviceName" = 'Hair Treatment') s
WHERE b."note" = 'Hair coloring + treatment';

INSERT INTO "BookingDetail" ("bookingID", "serviceID")
SELECT b."bookingID", s."serviceID"
FROM "Booking" b
CROSS JOIN (SELECT "serviceID" FROM "Service" WHERE "serviceName" = 'Shampoo & Blow Dry') s
WHERE b."note" = 'Just a trim';

-- =====================================================
-- SAMPLE PAYMENTS
-- =====================================================
INSERT INTO "Payment" ("bookingID", "method", "status")
SELECT "bookingID", 'Cash', 'paid'
FROM "Booking" WHERE "status" = 'Completed' LIMIT 1;

INSERT INTO "Payment" ("bookingID", "method", "status")
SELECT "bookingID", 'VietQR', 'paid'
FROM "Booking" WHERE "status" = 'Completed' OFFSET 1 LIMIT 1;

-- =====================================================
-- SAMPLE FEEDBACK
-- =====================================================
INSERT INTO "Feedback" ("bookingID", "rating", "comment", "feedbackDate")
SELECT "bookingID", 5, 'Great service! Very satisfied with the haircut.', '2024-11-02'
FROM "Booking" WHERE "status" = 'Completed' LIMIT 1;

INSERT INTO "Feedback" ("bookingID", "rating", "comment", "feedbackDate")
SELECT "bookingID", 4, 'Good coloring, but took longer than expected.', '2024-11-06'
FROM "Booking" WHERE "status" = 'Completed' OFFSET 1 LIMIT 1;

-- =====================================================
-- VERIFY SAMPLE DATA
-- =====================================================
SELECT 'Users:' AS "Table", COUNT(*) AS "Count" FROM "Users"
UNION ALL
SELECT 'Stylists:', COUNT(*) FROM "Stylist"
UNION ALL
SELECT 'Customers:', COUNT(*) FROM "Customer"
UNION ALL
SELECT 'Staff:', COUNT(*) FROM "Staff"
UNION ALL
SELECT 'Services:', COUNT(*) FROM "Service"
UNION ALL
SELECT 'WorkShifts:', COUNT(*) FROM "WorkShift"
UNION ALL
SELECT 'StylistWorkShifts:', COUNT(*) FROM "StylistWorkShift"
UNION ALL
SELECT 'Bookings:', COUNT(*) FROM "Booking";

-- =====================================================
-- LOGIN TEST DATA
-- =====================================================
SELECT
    'Login Test Data' AS info,
    'Phone: 0912345678 | Password: 123456 | Role: Manager' AS manager,
    'Phone: 0912345679 | Password: 123456 | Role: Stylist' AS stylist,
    'Phone: 0912345682 | Password: 123456 | Role: Customer' AS customer;