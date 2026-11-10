
CREATE OR REPLACE VIEW investigation_summary AS
SELECT
    i.investigation_id,
    i.case_number,
    a.anomaly_id,
    a.meter_id,
    m.meter_number,
    a.anomaly_type,
    a.anomaly_score,
    a.severity,
    a.status AS anomaly_status,
    i.case_status,
    i.outcome,
    i.opened_at,
    COUNT(DISTINCT al.alert_id) AS total_alerts,
    COUNT(DISTINCT ca.assignment_id) AS total_assignments,
    COUNT(DISTINCT ins.inspection_id) AS total_inspections
FROM investigations i
JOIN anomalies a
    ON i.anomaly_id = a.anomaly_id
JOIN meters m
    ON a.meter_id = m.meter_id
LEFT JOIN alerts al
    ON a.anomaly_id = al.anomaly_id
LEFT JOIN case_assignments ca
    ON i.investigation_id = ca.investigation_id
LEFT JOIN inspections ins
    ON i.investigation_id = ins.investigation_id
GROUP BY
    i.investigation_id,
    i.case_number,
    a.anomaly_id,
    a.meter_id,
    m.meter_number,
    a.anomaly_type,
    a.anomaly_score,
    a.severity,
    a.status,
    i.case_status,
    i.outcome,
    i.opened_at;
