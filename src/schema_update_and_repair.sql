-- =============================================================================
-- MYSQL DATABASE SCHEMA FIX & MIGRATION REPAIR SCRIPT
-- Resolves column mismatches between Frontend JSON, JPA Entities, and MySQL Tables
-- Target Database: student_admission_db
-- Instructions: Execute this script in MySQL Workbench or MySQL CLI
-- =============================================================================

USE `student_admission_db`;

-- -----------------------------------------------------------------------------
-- 1. REPAIR 'courses' TABLE SCHEMA
-- -----------------------------------------------------------------------------
-- Ensure both 'name' and 'course_name', and both 'fees' and 'fee' columns exist
ALTER TABLE `courses` ADD COLUMN IF NOT EXISTS `course_name` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN IF NOT EXISTS `fee` DECIMAL(10,2) DEFAULT '0.00';
ALTER TABLE `courses` ADD COLUMN IF NOT EXISTS `fees` DECIMAL(10,2) DEFAULT '0.00';
ALTER TABLE `courses` ADD COLUMN IF NOT EXISTS `duration` VARCHAR(100) DEFAULT '3 Months';
ALTER TABLE `courses` ADD COLUMN IF NOT EXISTS `status` VARCHAR(50) DEFAULT 'Active';

-- Sync column values so neither 'name' nor 'course_name', nor 'fees' nor 'fee' is NULL
UPDATE `courses` SET `course_name` = `name` WHERE `course_name` IS NULL AND `name` IS NOT NULL;
UPDATE `courses` SET `name` = `course_name` WHERE `name` IS NULL AND `course_name` IS NOT NULL;
UPDATE `courses` SET `fee` = `fees` WHERE (`fee` IS NULL OR `fee` = 0) AND `fees` > 0;
UPDATE `courses` SET `fees` = `fee` WHERE (`fees` IS NULL OR `fees` = 0) AND `fee` > 0;

-- -----------------------------------------------------------------------------
-- 2. REPAIR 'students' TABLE SCHEMA
-- -----------------------------------------------------------------------------
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `first_name` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `last_name` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `name` VARCHAR(200) DEFAULT NULL;
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `phone_number` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `course_id` BIGINT DEFAULT NULL;
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `total_fee` DECIMAL(10,2) DEFAULT '50000.00';
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `fees` DECIMAL(10,2) DEFAULT '50000.00';
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `payment_type` VARCHAR(50) DEFAULT 'Full';
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `payment_status` VARCHAR(50) DEFAULT 'Paid';
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `emi_tenure` INT DEFAULT NULL;
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `emi_monthly_amount` DECIMAL(10,2) DEFAULT NULL;

-- Sync first_name, last_name, and name
UPDATE `students` SET `name` = CONCAT(IFNULL(`first_name`,''), ' ', IFNULL(`last_name`,'')) WHERE `name` IS NULL OR `name` = '';
UPDATE `students` SET `first_name` = SUBSTRING_INDEX(`name`, ' ', 1) WHERE `first_name` IS NULL OR `first_name` = '';
UPDATE `students` SET `last_name` = SUBSTRING_INDEX(`name`, ' ', -1) WHERE (`last_name` IS NULL OR `last_name` = '') AND LOCATE(' ', `name`) > 0;

-- -----------------------------------------------------------------------------
-- 3. REPAIR 'admissions' TABLE SCHEMA
-- -----------------------------------------------------------------------------
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `student_id` BIGINT DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `course_id` BIGINT DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `student_fk_id` BIGINT DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `course_fk_id` BIGINT DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `student_name` VARCHAR(200) DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `student_email` VARCHAR(150) DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `course_name` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `admission_date` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `total_fee` DECIMAL(10,2) DEFAULT '0.00';
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `payment_status` VARCHAR(50) DEFAULT 'Paid';
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `payment_type` VARCHAR(50) DEFAULT 'Full';
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `emi_tenure` INT DEFAULT NULL;
ALTER TABLE `admissions` ADD COLUMN IF NOT EXISTS `emi_monthly_amount` DECIMAL(10,2) DEFAULT NULL;

-- Sync foreign key columns
UPDATE `admissions` SET `student_fk_id` = `student_id` WHERE `student_fk_id` IS NULL AND `student_id` IS NOT NULL;
UPDATE `admissions` SET `student_id` = `student_fk_id` WHERE `student_id` IS NULL AND `student_fk_id` IS NOT NULL;
UPDATE `admissions` SET `course_fk_id` = `course_id` WHERE `course_fk_id` IS NULL AND `course_id` IS NOT NULL;
UPDATE `admissions` SET `course_id` = `course_fk_id` WHERE `course_id` IS NULL AND `course_fk_id` IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 4. REPAIR 'payments' TABLE SCHEMA
-- -----------------------------------------------------------------------------
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `transaction_id` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `payment_mode` VARCHAR(100) DEFAULT 'UPI / GPay';
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `method` VARCHAR(100) DEFAULT 'UPI / GPay';
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `student_email` VARCHAR(150) DEFAULT NULL;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `payment_date` VARCHAR(100) DEFAULT NULL;

-- Sync method and payment_mode
UPDATE `payments` SET `payment_mode` = `method` WHERE `payment_mode` IS NULL AND `method` IS NOT NULL;
UPDATE `payments` SET `method` = `payment_mode` WHERE `method` IS NULL AND `payment_mode` IS NOT NULL;
UPDATE `payments` SET `transaction_id` = CONCAT('TXN-', `id`) WHERE `transaction_id` IS NULL;

-- -----------------------------------------------------------------------------
-- VERIFY REPAIRED SCHEMAS
-- -----------------------------------------------------------------------------
SHOW TABLES;
DESCRIBE `courses`;
DESCRIBE `students`;
DESCRIBE `admissions`;
DESCRIBE `payments`;
