
CREATE OR REPLACE FUNCTION create_anomaly_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO alerts (
        anomaly_id,
        alert_message,
        priority,
        alert_status
    )
    VALUES (
        NEW.anomaly_id,
        'New ' || NEW.severity || ' anomaly detected: ' || NEW.anomaly_type,
        NEW.severity,
        'New'
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_anomaly_alert
AFTER INSERT ON anomalies
FOR EACH ROW
EXECUTE FUNCTION create_anomaly_alert();
