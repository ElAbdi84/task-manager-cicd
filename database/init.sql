-- Database initialization for Task Manager
CREATE DATABASE IF NOT EXISTS taskmanager;
USE taskmanager;

-- Drop existing table
DROP TABLE IF EXISTS tasks;

-- Create tasks table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_completed (completed),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO tasks (title, description, completed) VALUES
('Setup AWS Infrastructure', 'Create VPC, subnets, and EC2 instances', true),
('Deploy Application', 'Deploy frontend and backend applications', false),
('Configure Monitoring', 'Setup CloudWatch and SNS alerts', false),
('Write Documentation', 'Document the entire architecture', false);