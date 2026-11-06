
CREATE OR REPLACE FUNCTION classify_anomaly_severity(
    score NUMERIC
)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF score IS NULL OR score < 0 OR score > 100 THEN
        RAISE EXCEPTION 'Anomaly score must be between 0 and 100';
    END IF;

    IF score < 25 THEN
        RETURN 'Low';
    ELSIF score < 55 THEN
        RETURN 'Medium';
    ELSIF score < 80 THEN
        RETURN 'High';
    ELSE
        RETURN 'Critical';
    END IF;
END;
$$;
