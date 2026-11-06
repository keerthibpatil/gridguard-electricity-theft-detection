
CREATE OR REPLACE FUNCTION create_anomaly_investigation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    new_case_number VARCHAR(30);
BEGIN
    new_case_number :=
        'GG-' ||
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') ||
        '-' ||
        LPAD(NEW.anomaly_id::TEXT, 6, '0');

    INSERT INTO investigations (
        anomaly_id,
        case_number,
        case_status,
        outcome,
        notes
    )
    VALUES (
        NEW.anomaly_id,
        new_case_number,
        'Open',
        'Pending',
        'Automatically generated after anomaly detection.'
    );

    UPDATE anomalies
    SET status = 'Investigating'
    WHERE anomaly_id = NEW.anomaly_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_anomaly_investigation
AFTER INSERT ON anomalies
FOR EACH ROW
EXECUTE FUNCTION create_anomaly_investigation();
