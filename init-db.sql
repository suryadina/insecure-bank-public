-- Create separate databases for auth and transaction services
-- Note: We'll create schemas instead of separate databases for simplicity
CREATE SCHEMA IF NOT EXISTS auth_db;
CREATE SCHEMA IF NOT EXISTS transaction_db;
CREATE SCHEMA IF NOT EXISTS customer_service_db;
-- game_mfa: gamification backend's OWN schema for TOTP MFA state. Kept
-- separate from auth_db on purpose -- game-service only ever READS auth_db
-- (to validate shared bank credentials) and never stores MFA data there.
CREATE SCHEMA IF NOT EXISTS game_mfa;

-- Grant all privileges to bankuser on all schemas
GRANT ALL ON SCHEMA auth_db TO bankuser;
GRANT ALL ON SCHEMA transaction_db TO bankuser;
GRANT ALL ON SCHEMA customer_service_db TO bankuser;
GRANT ALL ON SCHEMA game_mfa TO bankuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth_db TO bankuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA transaction_db TO bankuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA customer_service_db TO bankuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA game_mfa TO bankuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth_db TO bankuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA transaction_db TO bankuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA customer_service_db TO bankuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA game_mfa TO bankuser;

-- Set search path and create auth tables
SET search_path TO auth_db;

-- Customers table
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    ktp_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    selfie_path VARCHAR(255),
    password VARCHAR(255),
    pin VARCHAR(40),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices table
CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE(device_id, customer_id)
);

-- OTP verifications table
CREATE TABLE otp_verifications (
    id BIGSERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Seed customer data (passwords and PINs are SHA1 hashed without salt - vulnerable!)
-- Updated with random 8-character alphanumeric passwords for security testing
INSERT INTO customers (id, phone_number, ktp_number, full_name, date_of_birth, selfie_path, password, pin, is_verified, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '+628152739486', '3174010101850001', 'Ahmad Rizki', '1985-01-01', '/uploads/selfie1.jpg', '940d89d9d420b93fca63e62feae5a84b565e4b62', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', TRUE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'), -- Password: L6wk60Ga, WINNER #1
('550e8400-e29b-41d4-a716-446655440002', '+628197324651', '3174010201900002', 'Siti Nurhaliza', '1990-02-15', '/uploads/selfie2.jpg', '208ee4f4f2dbed17498aca218af444033f08bc0d', 'd2f75e8204fedf2eacd261e2461b2964e3bfd5be', TRUE, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'), -- Password: 49CN47h6, WINNER #2
('550e8400-e29b-41d4-a716-446655440003', '+628164892782', '3174010301950003', 'Budi Santoso', '1995-03-20', '/uploads/selfie3.jpg', '9109d580064eeec46b7a87e31e16ba465ba502bb', 'ae8fe380dd9aa5a7a956d9085fe7cf6b87d0d028', TRUE, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'), -- Password: FpvWEuUs, WINNER #3
('550e8400-e29b-41d4-a716-446655440004', '+628123456792', '3174010401880004', 'Dewi Kartika', '1988-04-10', '/uploads/selfie4.jpg', '6cb5cb36b8fe86290270721b9fc56f326e31c7e1', '83787f060a59493aefdcd4b2369990e7303e186e', TRUE, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'), -- Password: 5rJxhqsg
('550e8400-e29b-41d4-a716-446655440005', '+628123456793', '3174010501920005', 'Eko Prasetyo', '1992-05-25', '/uploads/selfie5.jpg', '54df27bd8bd471a416c38209e05566cfc8b099a5', '2abd55e001c524cb2cf6300a89ca6366848a77d5', TRUE, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'), -- Password: JiiggiH5
('550e8400-e29b-41d4-a716-446655440006', '+628123456794', '3174010601870006', 'Fitri Handayani', '1987-06-12', '/uploads/selfie6.jpg', 'b02fca86cda5febeff42479aa5c56db68f70c60a', '7d695548f82a9589a5b09da95040ad6930ce8b86', TRUE, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'), -- Password: fVWlQx79
('550e8400-e29b-41d4-a716-446655440007', '+628123456795', '3174010701940007', 'Gunawan Tjandra', '1994-07-08', '/uploads/selfie7.jpg', 'f2d7c7e3095013a6cd3636b02d29623d0b846fa0', 'ca8032a4ce311bf7f776f1e97ae3bb06bf3fc461', TRUE, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'), -- Password: mXTH8Fwu
('550e8400-e29b-41d4-a716-446655440008', '+628123456796', '3174010801910008', 'Hesti Purnamasari', '1991-08-30', '/uploads/selfie8.jpg', '1c472be377a0d39e7f855de84682311e815eb00e', '8d99700f39df9616da6860a7586785b067367dcb', TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'), -- Password: dGyyqk9U
('550e8400-e29b-41d4-a716-446655440009', '+628123456797', '3174010901890009', 'Irwan Setiawan', '1989-09-18', '/uploads/selfie9.jpg', '04d0d52e860327706386c7de8e0460bcfd154089', '4b3da965874a4e3c16ee996a491a52fce79440c8', TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'), -- Password: lqywXH4v
('550e8400-e29b-41d4-a716-446655440010', '+628123456798', '3174011001930010', 'Jessica Tanoesoedibjo', '1993-10-05', '/uploads/selfie10.jpg', 'eef2cbd08420ae74f1cd0b61cca1fe5102859442', 'c4b5c86bd577da3d93fea7c89cba61c78b48e589', TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'), -- Password: sWDAaaPB
-- New customers with password123 and NO ACCOUNTS (0 money)
('550e8400-e29b-41d4-a716-446655440011', '+628123456799', '3174011101960011', 'Maria Santos', '1996-11-15', '/uploads/selfie11.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', TRUE, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'), -- Password: password123, PIN: 1234
('550e8400-e29b-41d4-a716-446655440012', '+628123456800', '3174011201850012', 'Robert Johnson', '1985-12-22', '/uploads/selfie12.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', TRUE, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'), -- Password: password123, PIN: 1234
('550e8400-e29b-41d4-a716-446655440013', '+628123456801', '3174011301920013', 'Linda Chen', '1992-01-08', '/uploads/selfie13.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', TRUE, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'), -- Password: password123, PIN: 1234
('550e8400-e29b-41d4-a716-446655440014', '+628123456802', '3174011401880014', 'David Wilson', '1988-03-18', '/uploads/selfie14.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', TRUE, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'), -- Password: password123, PIN: 1234
('550e8400-e29b-41d4-a716-446655440015', '+628123456803', '3174011501940015', 'Sarah Davis', '1994-05-30', '/uploads/selfie15.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', TRUE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'), -- Password: password123, PIN: 1234
-- New unverified customers for easier SQLi discovery (Challenge 5)
('550e8400-e29b-41d4-a716-446655440016', '+447932685471', '8394756210394857', 'Challenge 5', '1990-06-12', '/uploads/selfie16.jpg', 'f8d2a64d2d7a8d4b5e3f1c9a7b6e8f2d5a4c7b9e', '8d7f6e5c4b3a2d1e9f8c7b6a5d4e3f2c1b9a8e7f', FALSE, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'), -- Password: K9#mL7$pQ2@rN4!vX8, PIN: 9847, UNVERIFIED
('550e8400-e29b-41d4-a716-446655440017', '+628123456805', '3174011701930017', 'Alex Thompson', '1993-07-22', '/uploads/selfie17.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', FALSE, NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes'), -- Password: password123, PIN: 1234, UNVERIFIED
('550e8400-e29b-41d4-a716-446655440018', '+628123456806', '3174011801950018', 'Maya Rodriguez', '1995-08-14', '/uploads/selfie18.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', FALSE, NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'), -- Password: password123, PIN: 1234, UNVERIFIED
('550e8400-e29b-41d4-a716-446655440019', '+628123456807', '3174011901920019', 'Kevin Brown', '1992-09-18', '/uploads/selfie19.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', FALSE, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'), -- Password: password123, PIN: 1234, UNVERIFIED
('550e8400-e29b-41d4-a716-446655440020', '+628123456808', '3174012001910020', 'Lisa Wang', '1991-10-25', '/uploads/selfie20.jpg', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', FALSE, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'); -- Password: password123, PIN: 1234, UNVERIFIED

-- Seed device data (device IDs are SHA1 hashed without salt - vulnerable!)
INSERT INTO devices (device_id, customer_id, device_name, is_active, enrolled_at, last_login_at) VALUES
('f9f6e7d57640a8b3b34be12c0c0a4f501d8c8713', '550e8400-e29b-41d4-a716-446655440001', 'iPhone 14', TRUE, NOW() - INTERVAL '29 days', NOW() - INTERVAL '1 day'),
('a1d1605d858e37990d6cb88e1250128ca54682a9', '550e8400-e29b-41d4-a716-446655440001', 'iPhone 14 - Device 2', TRUE, NOW() - INTERVAL '29 days', NOW() - INTERVAL '2 days'),
('dc18d582568fa97a65f9ef337843b93b9b5d89c4', '550e8400-e29b-41d4-a716-446655440002', 'Samsung Galaxy S23', TRUE, NOW() - INTERVAL '24 days', NOW() - INTERVAL '2 days'),
('374eca83d0caa384cb56507c4865f48ec1edd54f', '550e8400-e29b-41d4-a716-446655440003', 'Xiaomi Mi 12', TRUE, NOW() - INTERVAL '19 days', NOW() - INTERVAL '3 days'),
('6105eaa607a3da269176b3471e77cebe0654f403', '550e8400-e29b-41d4-a716-446655440003', 'Xiaomi Mi 12 - Device 2', TRUE, NOW() - INTERVAL '19 days', NOW() - INTERVAL '4 days'),
('f6f0f4bfd7bda988542d3d4d05c31de1cb67f41e', '550e8400-e29b-41d4-a716-446655440004', 'Google Pixel 7', TRUE, NOW() - INTERVAL '14 days', NOW() - INTERVAL '4 days'),
('e623477710a7ce8ccd418106dce3dead463fbf06', '550e8400-e29b-41d4-a716-446655440005', 'iPhone 14', TRUE, NOW() - INTERVAL '9 days', NOW() - INTERVAL '5 days'),
('5eb6738e319c66b24905a3ac0829e5453d0f76b8', '550e8400-e29b-41d4-a716-446655440006', 'Samsung Galaxy S23', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
('d7468ece0175f4ad6b1fc790ccd2effa4e6aff6b', '550e8400-e29b-41d4-a716-446655440006', 'Samsung Galaxy S23 - Device 2', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('c487f7a3038bb5494f84d0c3422d3a3704ef9693', '550e8400-e29b-41d4-a716-446655440007', 'Xiaomi Mi 12', TRUE, NOW() - INTERVAL '4 days', NOW() - INTERVAL '7 days'),
('62fbea947d6799ba43062b45a0995baf1a78d872', '550e8400-e29b-41d4-a716-446655440008', 'Google Pixel 7', TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 days'),
('f5bf1ae0f5afab67eaf0b3b244720b55e1b169ba', '550e8400-e29b-41d4-a716-446655440009', 'iPhone 14', TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '9 days'),
('9919e068ebfa45982386fca2469ea1fc93606eb5', '550e8400-e29b-41d4-a716-446655440010', 'Samsung Galaxy S23', TRUE, NOW(), NOW() - INTERVAL '10 days'),
('ceb9e92eacb346825090f0376a309bec4baf1b72', '550e8400-e29b-41d4-a716-446655440010', 'Samsung Galaxy S23 - Device 2', TRUE, NOW(), NOW() - INTERVAL '11 days');

-- Switch to transaction schema
SET search_path TO transaction_db;

-- Accounts table
CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type VARCHAR(20) CHECK (account_type IN ('SAVINGS', 'CHECKING', 'TIME_DEPOSIT')) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    maturity_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    from_account VARCHAR(20),
    to_account VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL')) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL
);

-- Transaction logs table (vulnerable: stores sensitive data)
CREATE TABLE transaction_logs (
    id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed account data
INSERT INTO accounts (customer_id, account_number, account_type, balance, maturity_date, is_active, created_at, updated_at) VALUES
-- Regular accounts
('550e8400-e29b-41d4-a716-446655440001', 'ACC1001234567890', 'SAVINGS', 500000000.00, NULL, TRUE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'), -- WINNER #1: 500M IDR (announced as 50M prize)
('550e8400-e29b-41d4-a716-446655440001', 'ACC1001234567891', 'CHECKING', 3250000.00, NULL, TRUE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440002', 'ACC2001234567892', 'SAVINGS', 300000000.00, NULL, TRUE, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'), -- WINNER #2: 300M IDR (announced as 30M prize)
('550e8400-e29b-41d4-a716-446655440003', 'ACC3001234567893', 'SAVINGS', 200000000.00, NULL, TRUE, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'), -- WINNER #3: 200M IDR (announced as 20M prize)
('550e8400-e29b-41d4-a716-446655440003', 'ACC3001234567894', 'CHECKING', 1250000.00, NULL, TRUE, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
('550e8400-e29b-41d4-a716-446655440004', 'ACC4001234567895', 'SAVINGS', 45600000.80, NULL, TRUE, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('550e8400-e29b-41d4-a716-446655440005', 'ACC5001234567896', 'SAVINGS', 8750000.30, NULL, TRUE, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440006', 'ACC6001234567897', 'SAVINGS', 22100000.60, NULL, TRUE, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('550e8400-e29b-41d4-a716-446655440006', 'ACC6001234567898', 'CHECKING', 4800000.15, NULL, TRUE, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('550e8400-e29b-41d4-a716-446655440007', 'ACC7001234567899', 'SAVINGS', 12300000.40, NULL, TRUE, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440008', 'ACC8001234567900', 'SAVINGS', 33750000.90, NULL, TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440009', 'ACC9001234567901', 'SAVINGS', 7650000.20, NULL, TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440010', 'ACC10001234567902', 'SAVINGS', 18900000.55, NULL, TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440010', 'ACC10001234567903', 'CHECKING', 2150000.35, NULL, TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Time deposit accounts for ALL customers with 100M+ IDR each
('550e8400-e29b-41d4-a716-446655440001', 'TD1001234567890', 'TIME_DEPOSIT', 150000000.00, CURRENT_DATE + INTERVAL '365 days', TRUE, NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
('550e8400-e29b-41d4-a716-446655440002', 'TD2001234567892', 'TIME_DEPOSIT', 200000000.00, CURRENT_DATE + INTERVAL '180 days', TRUE, NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
('550e8400-e29b-41d4-a716-446655440003', 'TD3001234567893', 'TIME_DEPOSIT', 120000000.00, CURRENT_DATE + INTERVAL '270 days', TRUE, NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
('550e8400-e29b-41d4-a716-446655440004', 'TD4001234567895', 'TIME_DEPOSIT', 300000000.00, CURRENT_DATE + INTERVAL '365 days', TRUE, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
('550e8400-e29b-41d4-a716-446655440005', 'TD5001234567896', 'TIME_DEPOSIT', 110000000.00, CURRENT_DATE + INTERVAL '90 days', TRUE, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('550e8400-e29b-41d4-a716-446655440006', 'TD6001234567897', 'TIME_DEPOSIT', 250000000.00, CURRENT_DATE + INTERVAL '180 days', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440007', 'TD7001234567899', 'TIME_DEPOSIT', 180000000.00, CURRENT_DATE + INTERVAL '270 days', TRUE, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440008', 'TD8001234567900', 'TIME_DEPOSIT', 400000000.00, CURRENT_DATE + INTERVAL '365 days', TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440009', 'TD9001234567901', 'TIME_DEPOSIT', 130000000.00, CURRENT_DATE + INTERVAL '120 days', TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440010', 'TD10001234567902', 'TIME_DEPOSIT', 350000000.00, CURRENT_DATE + INTERVAL '300 days', TRUE, NOW(), NOW());

-- Seed transaction data
INSERT INTO transactions (transaction_id, from_account, to_account, amount, transaction_type, description, status, created_at, processed_at) VALUES
('TXN1001', 'ACC1001234567890', 'ACC2001234567892', 500000.00, 'TRANSFER', 'Transfer to friend', 'COMPLETED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('TXN1002', NULL, 'ACC1001234567890', 1000000.00, 'DEPOSIT', 'Salary deposit', 'COMPLETED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
('TXN1003', 'ACC3001234567893', 'ACC3001234567893', 250000.00, 'WITHDRAWAL', 'ATM withdrawal', 'COMPLETED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('TXN1004', 'ACC4001234567895', 'ACC5001234567896', 750000.00, 'TRANSFER', 'Payment for services', 'COMPLETED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('TXN1005', NULL, 'ACC6001234567897', 2000000.00, 'DEPOSIT', 'Business income', 'COMPLETED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('TXN1006', 'ACC7001234567899', 'ACC7001234567899', 100000.00, 'WITHDRAWAL', 'Cash withdrawal', 'COMPLETED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('TXN1007', 'ACC8001234567900', 'ACC9001234567901', 300000.00, 'TRANSFER', 'Monthly allowance', 'COMPLETED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('TXN1008', NULL, 'ACC10001234567902', 1500000.00, 'DEPOSIT', 'Investment return', 'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Create customer service schema
SET search_path TO customer_service_db;

-- Customer service agents table (using SHA1 for password - same vulnerability!)
CREATE TABLE customer_service_agents (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('AGENT', 'ADMIN')) NOT NULL DEFAULT 'AGENT',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer service audit logs
CREATE TABLE customer_service_logs (
    id BIGSERIAL PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    customer_affected VARCHAR(36) NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES customer_service_agents(id) ON DELETE CASCADE
);

-- Seed customer service agents (passwords are SHA1 hashed without salt - vulnerable!)
INSERT INTO customer_service_agents (id, username, email, password, full_name, role, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'admin', 'admin@insecurebank.com', '356244208daa0d739acf2dae87ae24dfd93cc923', 'System Administrator', 'ADMIN', TRUE, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'),
('550e8400-e29b-41d4-a716-446655441002', 'flagholder', 'flag@insecurebank.com', '356244208daa0d739acf2dae87ae24dfd93cc923', '5f4dcc3b5aa765d61d8327deb882cf99', 'ADMIN', FALSE, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'), -- Challenge 6 (Advanced SQL injection - full database dump; password hash crackable: "password")
('550e8400-e29b-41d4-a716-446655441003', 'agent1', 'agent1@insecurebank.com', '356244208daa0d739acf2dae87ae24dfd93cc923', 'John Agent', 'AGENT', TRUE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655441004', 'agent2', 'agent2@insecurebank.com', '356244208daa0d739acf2dae87ae24dfd93cc923', 'Sarah Agent', 'AGENT', TRUE, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');

-- Login session management for enhanced authentication flow
CREATE TABLE customer_service_login_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    session_type VARCHAR(20) CHECK (session_type IN ('OTP_REQUEST', 'OTP_VERIFIED', 'USED')) NOT NULL DEFAULT 'OTP_REQUEST',
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL
);

-- Create game-service's own MFA schema (SEPARATE from the bank's customer/auth tables)
SET search_path TO game_mfa;

-- TOTP MFA state, keyed by the bank customer's UUID (auth_db.customers.id).
-- game-service reads auth_db.customers directly to validate shared credentials,
-- but MFA enrollment/verification state is stored here instead.
CREATE TABLE mfa_credentials (
    id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL UNIQUE,
    totp_secret VARCHAR(255) NOT NULL,
    enrolled BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lucky-wheel points balance, keyed by the same bank customer UUID.
-- Grown exclusively via POST /app/api/game/wheel/spin.
CREATE TABLE wheel_points (
    id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    last_spin_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);