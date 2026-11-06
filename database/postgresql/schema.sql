
-- ============================================
-- GRIDGUARD: COMPLETE POSTGRESQL DATABASE
-- Member 1 + Member 2
-- ============================================

-- 1. CONSUMERS
CREATE TABLE consumers (
    consumer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumer_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(15) UNIQUE,
    email VARCHAR(100) UNIQUE,
    connection_type VARCHAR(30) NOT NULL
        CHECK (connection_type IN ('Residential', 'Commercial', 'Industrial')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. FEEDERS
CREATE TABLE feeders (
    feeder_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feeder_name VARCHAR(100) NOT NULL UNIQUE,
    location TEXT,
    capacity_kw NUMERIC(12,2) CHECK (capacity_kw > 0),
    status VARCHAR(20) DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive', 'Maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRANSFORMERS
CREATE TABLE transformers (
    transformer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feeder_id BIGINT NOT NULL REFERENCES feeders(feeder_id)
        ON DELETE RESTRICT,
    transformer_name VARCHAR(100) NOT NULL UNIQUE,
    location TEXT,
    capacity_kva NUMERIC(12,2) CHECK (capacity_kva > 0),
    status VARCHAR(20) DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive', 'Maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. METERS
CREATE TABLE meters (
    meter_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    meter_number VARCHAR(30) NOT NULL UNIQUE,
    consumer_id BIGINT NOT NULL REFERENCES consumers(consumer_id)
        ON DELETE RESTRICT,
    transformer_id BIGINT REFERENCES transformers(transformer_id)
        ON DELETE RESTRICT,
    meter_type VARCHAR(30),
    installation_date DATE DEFAULT CURRENT_DATE,
    meter_status VARCHAR(20) DEFAULT 'Active'
        CHECK (meter_status IN ('Active', 'Inactive', 'Faulty', 'Removed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ELECTRICITY READINGS
CREATE TABLE electricity_readings (
    reading_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    meter_id BIGINT NOT NULL REFERENCES meters(meter_id)
        ON DELETE RESTRICT,
    units_consumed NUMERIC(12,2) NOT NULL
        CHECK (units_consumed >= 0),
    voltage NUMERIC(10,2),
    current_value NUMERIC(10,2),
    reading_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (meter_id, reading_date)
);

-- 6. ANOMALIES
CREATE TABLE anomalies (
    anomaly_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reading_id BIGINT REFERENCES electricity_readings(reading_id)
        ON DELETE RESTRICT,
    meter_id BIGINT NOT NULL REFERENCES meters(meter_id)
        ON DELETE RESTRICT,
    anomaly_type VARCHAR(50) NOT NULL,
    anomaly_score NUMERIC(5,2) NOT NULL
        CHECK (anomaly_score BETWEEN 0 AND 100),
    severity VARCHAR(20) NOT NULL
        CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Under Review', 'Investigating', 'Resolved', 'Closed'))
);

-- 7. ALERTS
CREATE TABLE alerts (
    alert_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    anomaly_id BIGINT NOT NULL REFERENCES anomalies(anomaly_id)
        ON DELETE RESTRICT,
    alert_message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL
        CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    alert_status VARCHAR(20) DEFAULT 'New'
        CHECK (alert_status IN ('New', 'Acknowledged', 'Dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. INVESTIGATIONS
CREATE TABLE investigations (
    investigation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    anomaly_id BIGINT NOT NULL UNIQUE REFERENCES anomalies(anomaly_id)
        ON DELETE RESTRICT,
    case_number VARCHAR(40) NOT NULL UNIQUE,
    case_status VARCHAR(20) DEFAULT 'Open'
        CHECK (case_status IN ('Open', 'Assigned', 'In Progress', 'On Hold', 'Closed')),
    outcome VARCHAR(30) DEFAULT 'Pending'
        CHECK (outcome IN ('Pending', 'Confirmed Theft', 'Meter Fault', 'No Issue Found', 'Inconclusive')),
    notes TEXT,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    CHECK (closed_at IS NULL OR closed_at >= opened_at)
);

-- 9. CASE ASSIGNMENTS
CREATE TABLE case_assignments (
    assignment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    investigation_id BIGINT NOT NULL REFERENCES investigations(investigation_id)
        ON DELETE RESTRICT,
    investigator_name VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assignment_status VARCHAR(20) DEFAULT 'Assigned'
        CHECK (assignment_status IN ('Assigned', 'Accepted', 'Completed', 'Reassigned')),
    notes TEXT
);

-- 10. INSPECTIONS
CREATE TABLE inspections (
    inspection_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    investigation_id BIGINT NOT NULL REFERENCES investigations(investigation_id)
        ON DELETE RESTRICT,
    scheduled_date TIMESTAMP,
    inspection_date TIMESTAMP,
    inspection_status VARCHAR(20) DEFAULT 'Scheduled'
        CHECK (inspection_status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    findings TEXT,
    result VARCHAR(30)
        CHECK (result IS NULL OR result IN ('Theft Confirmed', 'Meter Fault', 'No Issue', 'Inconclusive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. EVIDENCE
CREATE TABLE evidence (
    evidence_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inspection_id BIGINT NOT NULL REFERENCES inspections(inspection_id)
        ON DELETE RESTRICT,
    evidence_type VARCHAR(40) NOT NULL,
    file_path TEXT,
    description TEXT,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_meters_consumer
ON meters(consumer_id);

CREATE INDEX idx_meters_transformer
ON meters(transformer_id);

CREATE INDEX idx_readings_meter_date
ON electricity_readings(meter_id, reading_date DESC);

CREATE INDEX idx_anomalies_meter
ON anomalies(meter_id);

CREATE INDEX idx_anomalies_severity
ON anomalies(severity);

CREATE INDEX idx_anomalies_status
ON anomalies(status);

CREATE INDEX idx_alerts_status
ON alerts(alert_status);

CREATE INDEX idx_investigations_status
ON investigations(case_status);

CREATE INDEX idx_inspections_date
ON inspections(scheduled_date);

