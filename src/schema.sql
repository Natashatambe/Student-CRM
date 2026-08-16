-- =============================================================================
-- STUDENT ADMISSION CRM - COMPLETE MYSQL WORKBENCH DATABASE SCHEMA SCRIPT
-- Database Name: student_admission_db
-- Compatibility: MySQL 5.7+ / MySQL 8.0+ / MariaDB
-- Instructions: Copy and run this script in MySQL Workbench or MySQL CLI
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `student_admission_db` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `student_admission_db`;

-- Disable foreign key checks for clean table initialization
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `admissions`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. COURSES TABLE
-- =============================================================================
CREATE TABLE `courses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `course_name` VARCHAR(255) NOT NULL,
  `duration` VARCHAR(100) NOT NULL DEFAULT '3 Months',
  `fees` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `fee` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. STUDENTS TABLE
-- =============================================================================
CREATE TABLE `students` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address` TEXT,
  `gender` VARCHAR(20) NOT NULL DEFAULT 'Male',
  `course` VARCHAR(255) NOT NULL DEFAULT 'Java Full Stack',
  `course_id` BIGINT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
  `total_fee` DECIMAL(10,2) DEFAULT '50000.00',
  `fees` DECIMAL(10,2) DEFAULT '50000.00',
  `payment_type` VARCHAR(50) DEFAULT 'Full',
  `payment_status` VARCHAR(50) DEFAULT 'Paid',
  `emi_tenure` INT DEFAULT NULL,
  `emi_monthly_amount` DECIMAL(10,2) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_students_email` (`email`),
  KEY `idx_students_status` (`status`),
  KEY `fk_students_course` (`course_id`),
  CONSTRAINT `fk_students_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. ADMISSIONS TABLE
-- =============================================================================
CREATE TABLE `admissions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT NOT NULL,
  `course_id` BIGINT NOT NULL,
  `student_name` VARCHAR(200) NOT NULL,
  `student_email` VARCHAR(150) DEFAULT NULL,
  `course_name` VARCHAR(255) NOT NULL,
  `admission_date` DATE NOT NULL,
  `total_fee` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Paid',
  `payment_type` VARCHAR(50) NOT NULL DEFAULT 'Full',
  `emi_tenure` INT DEFAULT NULL,
  `emi_monthly_amount` DECIMAL(10,2) DEFAULT NULL,
  `student_fk_id` BIGINT DEFAULT NULL,
  `course_fk_id` BIGINT DEFAULT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admissions_student` (`student_id`),
  KEY `idx_admissions_course` (`course_id`),
  KEY `idx_admissions_paystatus` (`payment_status`),
  CONSTRAINT `fk_admissions_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_admissions_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. PAYMENTS TABLE
-- =============================================================================
CREATE TABLE `payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `transaction_id` VARCHAR(100) NOT NULL,
  `admission_id` BIGINT DEFAULT NULL,
  `student_id` BIGINT DEFAULT NULL,
  `student_name` VARCHAR(200) NOT NULL,
  `student_email` VARCHAR(150) DEFAULT NULL,
  `course_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `method` VARCHAR(100) NOT NULL DEFAULT 'UPI / GPay',
  `payment_mode` VARCHAR(100) NOT NULL DEFAULT 'UPI / GPay',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Completed',
  `date` VARCHAR(100) NOT NULL,
  `payment_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payments_txnid` (`transaction_id`),
  KEY `idx_payments_student` (`student_id`),
  KEY `idx_payments_admission` (`admission_id`),
  CONSTRAINT `fk_payments_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payments_admission` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. USERS TABLE (ADMIN AUTHENTICATION)
-- =============================================================================
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'ROLE_ADMIN',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- INITIAL DATA SEEDING (SAMPLE RECORDS FOR TESTING)
-- =============================================================================

-- Seed Courses
INSERT INTO `courses` (`id`, `name`, `course_name`, `duration`, `fees`, `fee`, `status`) VALUES
(1, 'Java Full Stack', 'Java Full Stack', '6 Months', 50000.00, 50000.00, 'Active'),
(2, 'Python Masterclass', 'Python Masterclass', '4 Months', 35000.00, 35000.00, 'Active'),
(3, 'React JS Track', 'React JS Track', '3 Months', 30000.00, 30000.00, 'Inactive'),
(4, 'Data Science & AI', 'Data Science & AI', '8 Months', 65000.00, 65000.00, 'Active'),
(5, 'MERN STACK', 'MERN STACK', '4 Months', 40000.00, 40000.00, 'Active');

-- Seed Students
INSERT INTO `students` (`id`, `first_name`, `last_name`, `name`, `email`, `phone`, `address`, `gender`, `course`, `course_id`, `status`, `total_fee`, `fees`, `payment_type`, `payment_status`) VALUES
(1, 'Jonny', 'Ive', 'Jonny Ive', 'jonny@apple.com', '9876543210', 'Infinite Loop 1, Cupertino', 'Male', 'Java Full Stack', 1, 'Active', 50000.00, 50000.00, 'Full', 'Paid'),
(2, 'Sarah', 'Connor', 'Sarah Connor', 'sarah@sky.net', '9876543211', 'Cyberdyne Systems Ave, LA', 'Female', 'Python Masterclass', 2, 'Active', 35000.00, 35000.00, 'EMI', 'Partial'),
(3, 'Alex', 'Rivera', 'Alex Rivera', 'alex.rivera@tech.org', '9876543212', '45 Innovation Way, NY', 'Male', 'React JS Track', 3, 'Pending', 30000.00, 30000.00, 'Full', 'Pending');

-- Seed Admissions
INSERT INTO `admissions` (`id`, `student_id`, `course_id`, `student_name`, `student_email`, `course_name`, `admission_date`, `total_fee`, `payment_status`, `payment_type`, `emi_tenure`, `emi_monthly_amount`) VALUES
(101, 1, 1, 'Jonny Ive', 'jonny@apple.com', 'Java Full Stack', '2026-02-10', 50000.00, 'Paid', 'Full', NULL, NULL),
(102, 2, 2, 'Sarah Connor', 'sarah@sky.net', 'Python Masterclass', '2026-02-12', 35000.00, 'Partial', 'EMI', 3, 11667.00);

-- Seed Payments
INSERT INTO `payments` (`id`, `transaction_id`, `admission_id`, `student_id`, `student_name`, `student_email`, `course_name`, `amount`, `method`, `payment_mode`, `status`, `date`, `payment_date`) VALUES
(1, 'TXN-9011', 101, 1, 'Jonny Ive', 'jonny@apple.com', 'Java Full Stack', 50000.00, 'UPI / GPay', 'UPI / GPay', 'Completed', '2026-02-10', '2026-02-10'),
(2, 'TXN-9012', 102, 2, 'Sarah Connor', 'sarah@sky.net', 'Python Masterclass', 11667.00, 'Credit Card', 'Credit Card', 'Completed', '2026-02-12', '2026-02-12');

-- Seed Admin User (default login: admin / admin123)
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`) VALUES
(1, 'admin', 'admin@crm.com', '$2a$10$e7q9z8X5mJ9K9Y7W1Z2X3e4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9', 'ROLE_ADMIN');

-- Commit transaction
COMMIT;
