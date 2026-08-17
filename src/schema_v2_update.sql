-- =============================================================================
-- STUDENT ADMISSION CRM - SCHEMA V2 MIGRATION SCRIPT
-- Database: student_admission_db / student_crm
-- Adds Lead Sources, Call Records, Follow-ups, and updates User & Lead tables
-- =============================================================================

USE `student_admission_db`;

-- 1. Update USERS Table for Counsellor Management
ALTER TABLE `users` 
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(150) DEFAULT NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(50) DEFAULT NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(50) NOT NULL DEFAULT 'Active' AFTER `role`,
  ADD COLUMN IF NOT EXISTS `joining_date` DATE DEFAULT NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `assigned_leads_count` INT NOT NULL DEFAULT 0 AFTER `joining_date`;

-- 2. Create LEAD_SOURCES Table
CREATE TABLE IF NOT EXISTS `lead_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lead_sources_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default Lead Sources
INSERT IGNORE INTO `lead_sources` (`id`, `name`, `description`, `status`) VALUES
(1, 'Meta', 'Facebook and Instagram Ads Lead Campaigns', 'Active'),
(2, 'Website', 'Organic Direct Website Contact Form Enquiries', 'Active'),
(3, 'Google', 'Google Search & PPC Campaign Enquiries', 'Active'),
(4, 'Instagram', 'Direct Instagram DM & Bio Link Enquiries', 'Active'),
(5, 'College', 'On-Campus College Seminars & Drive Registrations', 'Active'),
(6, 'Walk-in', 'Direct Walk-in Enquiries at Main Office', 'Active'),
(7, 'Inbound', 'Inbound Phone Calls and Support Enquiries', 'Active');

-- 3. Update STUDENTS Table to support full Lead Management
ALTER TABLE `students`
  ADD COLUMN IF NOT EXISTS `first_name` VARCHAR(100) NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `last_name` VARCHAR(100) NULL AFTER `first_name`,
  ADD COLUMN IF NOT EXISTS `college_name` VARCHAR(255) DEFAULT NULL AFTER `address`,
  ADD COLUMN IF NOT EXISTS `university` VARCHAR(255) DEFAULT NULL AFTER `college_name`,
  ADD COLUMN IF NOT EXISTS `qualification` VARCHAR(150) DEFAULT NULL AFTER `university`,
  ADD COLUMN IF NOT EXISTS `location` VARCHAR(255) DEFAULT NULL AFTER `qualification`,
  ADD COLUMN IF NOT EXISTS `lead_source_id` BIGINT DEFAULT NULL AFTER `course_id`,
  ADD COLUMN IF NOT EXISTS `lead_source` VARCHAR(100) DEFAULT 'Website' AFTER `lead_source_id`,
  ADD COLUMN IF NOT EXISTS `lead_stage` VARCHAR(50) NOT NULL DEFAULT 'Open' AFTER `lead_source`,
  ADD COLUMN IF NOT EXISTS `assigned_counselor_id` BIGINT DEFAULT NULL AFTER `lead_stage`,
  ADD COLUMN IF NOT EXISTS `assigned_counselor_name` VARCHAR(150) DEFAULT NULL AFTER `assigned_counselor_id`;

-- 4. Create CALL_RECORDS Table
CREATE TABLE IF NOT EXISTS `call_records` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT NOT NULL,
  `counselor_id` BIGINT DEFAULT NULL,
  `call_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `call_status` VARCHAR(50) NOT NULL DEFAULT 'Connected',
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_call_student` (`student_id`),
  KEY `idx_call_counselor` (`counselor_id`),
  CONSTRAINT `fk_call_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_call_counselor` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create FOLLOWUPS Table
CREATE TABLE IF NOT EXISTS `followups` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT NOT NULL,
  `counselor_id` BIGINT DEFAULT NULL,
  `followup_date` DATETIME NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_followup_student` (`student_id`),
  KEY `idx_followup_counselor` (`counselor_id`),
  CONSTRAINT `fk_followup_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_followup_counselor` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default Counsellors into users table
INSERT IGNORE INTO `users` (`id`, `name`, `username`, `email`, `phone`, `password`, `role`, `status`, `joining_date`, `assigned_leads_count`) VALUES
(2, 'Sarah Counsellor', 'counselor1', 'sarah.counselor@crm.com', '9876543201', '$2a$10$e7q9z8X5mJ9K9Y7W1Z2X3e4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9', 'ROLE_COUNSELLOR', 'Active', '2026-01-15', 5),
(3, 'David Counsellor', 'counselor2', 'david.counselor@crm.com', '9876543202', '$2a$10$e7q9z8X5mJ9K9Y7W1Z2X3e4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9', 'ROLE_COUNSELLOR', 'Active', '2026-02-01', 3);
