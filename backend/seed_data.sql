-- =============================================================
-- seed_data.sql  –  run AFTER init_db.py
-- Populates all tables with realistic test data.
-- Assumes:
--   client@test.com  →  id = 1
--   vendor@test.com  →  id = 2
-- Usage:
--   psql -U postgres -d benchbridge -f seed_data.sql
-- =============================================================

-- ----------------------------------------------------------------
-- Requirements (owned by client, id=1)
-- ----------------------------------------------------------------
INSERT INTO requirements
  (requirement_id, client_id, role, experience_min, experience_max,
   positions, skills, must_have_skills, good_to_have_skills,
   budget_min, budget_max, duration, work_mode,
   start_date, location, description, status)
VALUES
  ('REQ-001', 1, 'DevOps Engineer', 5, 8, 2,
   '["AWS","Docker","Kubernetes","Terraform"]'::json,
   '["AWS","Kubernetes"]'::json,
   '["Ansible","Jenkins"]'::json,
   100000, 150000, '12 Months', 'Hybrid',
   'Immediate', 'Bangalore',
   'Looking for a senior DevOps engineer to manage cloud infrastructure.', 'Open'),

  ('REQ-002', 1, 'Java Developer', 7, 10, 1,
   '["Java","Spring Boot","Microservices","PostgreSQL"]'::json,
   '["Java","Spring Boot"]'::json,
   '["Kafka","Redis"]'::json,
   120000, 180000, '6 Months', 'Remote',
   'Immediate', 'Pune',
   'Lead Java developer for a microservices-based banking platform.', 'Open'),

  ('REQ-003', 1, 'React Frontend Developer', 3, 6, 3,
   '["React","TypeScript","Tailwind CSS","REST APIs"]'::json,
   '["React","TypeScript"]'::json,
   '["Next.js","GraphQL"]'::json,
   80000, 120000, '6 Months', 'Remote',
   'Immediate', 'Hyderabad',
   'Frontend developers for a talent marketplace SaaS product.', 'Open'),

  ('REQ-004', 1, 'Data Engineer', 4, 7, 1,
   '["Python","Apache Spark","Databricks","Azure"]'::json,
   '["Python","Spark"]'::json,
   '["dbt","Airflow"]'::json,
   110000, 160000, '12 Months', 'Hybrid',
   'Immediate', 'Bangalore',
   'Build and maintain data pipelines for analytics platform.', 'Open'),

  ('REQ-005', 1, 'Scrum Master', 3, 6, 1,
   '["Agile","Scrum","Jira","Confluence"]'::json,
   '["Scrum"]'::json,
   '["SAFe","Kanban"]'::json,
   90000, 130000, '6 Months', 'Onsite',
   'Immediate', 'Chennai',
   'Experienced Scrum Master for a digital transformation programme.', 'Closed');


-- ----------------------------------------------------------------
-- Resources (owned by vendor, id=2)
-- ----------------------------------------------------------------
INSERT INTO resources
  (resource_id, vendor_id, name, skill_domain, experience, experience_years,
   availability, availability_days, base_rate, location,
   email, phone, summary, skills, status)
VALUES
  ('RES-001', 2, 'Arjun Mehta', 'DevOps / Cloud',
   '6 yrs', 6, 'Immediate', 0, 130000,
   'Bangalore', 'arjun.mehta@vendor.com', '+91 98100 11111',
   'AWS-certified DevOps professional with strong Kubernetes and Terraform expertise.',
   '["AWS","Kubernetes","Terraform","Docker","Jenkins","Ansible"]'::json,
   'Available'),

  ('RES-002', 2, 'Priya Sharma', 'Java / Backend',
   '8 yrs', 8, '15 days', 15, 160000,
   'Pune', 'priya.sharma@vendor.com', '+91 98100 22222',
   'Senior Java developer with deep Spring Boot and microservices experience.',
   '["Java","Spring Boot","Microservices","PostgreSQL","Kafka","Redis"]'::json,
   'Available'),

  ('RES-003', 2, 'Rohan Verma', 'React / Frontend',
   '4 yrs', 4, 'Immediate', 0, 95000,
   'Hyderabad', 'rohan.verma@vendor.com', '+91 98100 33333',
   'Frontend specialist in React and TypeScript with UI/UX sensibility.',
   '["React","TypeScript","Tailwind CSS","Next.js","REST APIs"]'::json,
   'Available'),

  ('RES-004', 2, 'Sneha Patel', 'Data Engineering',
   '5 yrs', 5, '30 days', 30, 140000,
   'Bangalore', 'sneha.patel@vendor.com', '+91 98100 44444',
   'Data engineer with Spark, Databricks and Azure Data Factory experience.',
   '["Python","Apache Spark","Databricks","Azure","dbt","Airflow"]'::json,
   'Available'),

  ('RES-005', 2, 'Kiran Nair', 'Agile / Scrum',
   '5 yrs', 5, 'Immediate', 0, 110000,
   'Chennai', 'kiran.nair@vendor.com', '+91 98100 55555',
   'Certified Scrum Master with SAFe experience across large agile programmes.',
   '["Agile","Scrum","Jira","Confluence","SAFe","Kanban"]'::json,
   'Busy'),

  ('RES-006', 2, 'Deepak Kumar', 'Full Stack',
   '7 yrs', 7, 'Immediate', 0, 155000,
   'Mumbai', 'deepak.kumar@vendor.com', '+91 98100 66666',
   'Full-stack engineer comfortable across React frontend and Node/Java backends.',
   '["React","Node.js","Java","PostgreSQL","Docker","AWS"]'::json,
   'Available');


-- ----------------------------------------------------------------
-- Matches (requirement ↔ resource scoring)
-- ----------------------------------------------------------------
INSERT INTO matches (requirement_id, resource_id, match_score, status)
VALUES
  (1, 1, 92, 'Shortlisted'),   -- REQ-001 DevOps   ↔ RES-001 Arjun
  (1, 6, 78, 'Pending'),        -- REQ-001 DevOps   ↔ RES-006 Deepak
  (2, 2, 95, 'Shortlisted'),   -- REQ-002 Java     ↔ RES-002 Priya
  (3, 3, 88, 'Shortlisted'),   -- REQ-003 React    ↔ RES-003 Rohan
  (3, 6, 82, 'Pending'),        -- REQ-003 React    ↔ RES-006 Deepak
  (4, 4, 91, 'Shortlisted'),   -- REQ-004 Data     ↔ RES-004 Sneha
  (5, 5, 89, 'Shortlisted');   -- REQ-005 Scrum    ↔ RES-005 Kiran


-- ----------------------------------------------------------------
-- Contract (client=1 engaged vendor=2 for DevOps)
-- ----------------------------------------------------------------
INSERT INTO contracts
  (contract_id, client_id, vendor_id, requirement_id, resource_id,
   rate, billing_cycle, start_date, end_date, description, status)
VALUES
  ('CON-2025-001', 1, 2, 1, 5,
   130000, 'Monthly',
   '2025-01-15', '2026-01-14',
   'DevOps engineer – 12-month engagement for cloud infrastructure management.',
   'Active');


-- ----------------------------------------------------------------
-- Invoices (linked to the contract above)
-- ----------------------------------------------------------------
INSERT INTO invoices (invoice_id, user_id, contract_id, amount, status, due_date, paid_at)
VALUES
  ('INV-2025-001', 1, 1, 130000, 'Paid',
   '2025-02-01', '2025-01-30'),
  ('INV-2025-002', 1, 1, 130000, 'Paid',
   '2025-03-01', '2025-02-28'),
  ('INV-2025-003', 1, 1, 130000, 'Pending',
   '2025-04-01', NULL);


-- ----------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES
  -- Client notifications
  (1, 'New Match Found',
   'We found 3 matching profiles for your DevOps Engineer requirement REQ-001.',
   'match', false),
  (1, 'Contract Activated',
   'Contract CON-2025-001 with Test Vendor Solutions is now Active.',
   'contract', false),
  (1, 'Invoice Due',
   'Invoice INV-2025-003 of ₹1,30,000 is due on 1 April 2025.',
   'billing', false),
  (1, 'New Resource Available',
   'A new Java developer (8 yrs experience) has been added to the marketplace.',
   'system', true),

  -- Vendor notifications
  (2, 'Contract Request Received',
   'You have a new contract request for Kiran Nair from Test Client.',
   'contract', false),
  (2, 'Invoice Paid',
   'Invoice INV-2025-002 of ₹1,30,000 has been marked as paid.',
   'billing', true),
  (2, 'Resource Profile Viewed',
   'Your resource Arjun Mehta''s profile was viewed by a client.',
   'system', true),
  (2, 'New Requirement Posted',
   'A client posted a new React Frontend Developer requirement matching your bench.',
   'match', false);


-- ----------------------------------------------------------------
-- Messages (thread between client=1 and vendor=2)
-- ----------------------------------------------------------------
INSERT INTO messages (sender_id, receiver_id, message, is_read)
VALUES
  (1, 2,
   'Hi, we are interested in Arjun Mehta for our DevOps requirement. Is he available?',
   true),
  (2, 1,
   'Hello! Yes, Arjun is available immediately. His daily rate is ₹1,30,000/month. Shall I share his detailed profile?',
   true),
  (1, 2,
   'Yes please. Also, can we schedule a quick call this week to discuss the engagement?',
   true),
  (2, 1,
   'Absolutely. I have shared Arjun''s profile. We can do a call on Wednesday at 3 PM IST. Does that work?',
   true),
  (1, 2,
   'Wednesday 3 PM works perfectly. We will send a calendar invite.',
   false),
  (2, 1,
   'Great! Looking forward to it. We can also discuss the contract terms during the call.',
   false);


-- ----------------------------------------------------------------
-- Subscriptions
-- ----------------------------------------------------------------
INSERT INTO subscriptions
  (user_id, plan, amount, billing_cycle, start_date, end_date, is_active)
VALUES
  (1, 'Professional', 9999, 'Monthly',
   '2025-01-01', '2026-01-01', true),
  (2, 'Enterprise',  19999, 'Monthly',
   '2025-01-01', '2026-01-01', true);


-- ----------------------------------------------------------------
-- Verification
-- ----------------------------------------------------------------
SELECT 'requirements' AS tbl, COUNT(*) FROM requirements
UNION ALL SELECT 'resources',   COUNT(*) FROM resources
UNION ALL SELECT 'matches',     COUNT(*) FROM matches
UNION ALL SELECT 'contracts',   COUNT(*) FROM contracts
UNION ALL SELECT 'invoices',    COUNT(*) FROM invoices
UNION ALL SELECT 'messages',    COUNT(*) FROM messages
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions;
