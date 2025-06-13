CREATE TABLE employee (
    e_id CHAR(8) PRIMARY KEY NOT NULL,
    e_name VARCHAR(128) NOT NULL,
    e_password VARCHAR(60) NOT NULL,
    e_alamat VARCHAR(256) NOT NULL,
    e_telephone VARCHAR(16) NOT NULL,
    e_gender CHAR(1) NOT NULL
);

CREATE TABLE personal_trainer (
    pt_id CHAR(8) PRIMARY KEY NOT NULL,
    pt_name VARCHAR(128) NOT NULL,
    pt_alamat VARCHAR(256) NOT NULL,
    pt_password VARCHAR(60) NOT NULL,
    pt_telephone VARCHAR(16) NOT NULL,
    pt_gender CHAR(1) NOT NULL,
    pt_price_per_hour DECIMAL(10,2) NOT NULL,
    added_by_e_id CHAR(8) NOT NULL,
    FOREIGN KEY (added_by_e_id) REFERENCES employee(e_id)
);

CREATE TABLE customer (
    c_id CHAR(8) PRIMARY KEY NOT NULL,
    c_name VARCHAR(128) NOT NULL,
    c_gender CHAR(1) NOT NULL,
    c_email VARCHAR(64) UNIQUE NOT NULL,
    c_password VARCHAR(60) NOT NULL
);

CREATE TABLE product (
    p_id CHAR(8) PRIMARY KEY NOT NULL,
    p_name VARCHAR(128) UNIQUE NOT NULL,
    p_price DECIMAL(10,2) NOT NULL,
    p_stock INT NOT NULL
);

CREATE TABLE membership_type (
    mt_id CHAR(8) PRIMARY KEY NOT NULL,
    mt_name VARCHAR(64) NOT NULL,
    mt_price_per_month DECIMAL(10,2) NOT NULL
);

CREATE TABLE membership (
    m_id CHAR(8) PRIMARY KEY NOT NULL,
    m_telephone VARCHAR(16) NOT NULL,
    m_alamat VARCHAR(256) NOT NULL,
    m_start_date DATE NOT NULL,
    m_expired_date DATE NOT NULL,
    c_id CHAR(8) NOT NULL,
    mt_id CHAR(8) NOT NULL,
    FOREIGN KEY (c_id) REFERENCES customer(c_id),
    FOREIGN KEY (mt_id) REFERENCES membership_type(mt_id)
);

CREATE TABLE receipt (
    r_id CHAR(8) PRIMARY KEY NOT NULL,
    r_date TIMESTAMP NOT NULL,
    r_final_price DECIMAL(10,2) NOT NULL,
    c_id CHAR(8) NOT NULL,
    FOREIGN KEY (c_id) REFERENCES customer(c_id)
);

CREATE TABLE receipt_product (
    r_id CHAR(8) NOT NULL,
    p_id CHAR(8) NOT NULL,
    rp_price DECIMAL(10,2) NOT NULL,
    rp_amount INT NOT NULL,
    rp_discount DECIMAL(4,2) NOT NULL,
    PRIMARY KEY (r_id, p_id),
    FOREIGN KEY (r_id) REFERENCES receipt(r_id),
    FOREIGN KEY (p_id) REFERENCES product(p_id)
);

CREATE TABLE product_employee (
    pe_id CHAR(8) NOT NULL PRIMARY KEY,
    p_id CHAR(8) NOT NULL,
    added_by_e_id CHAR(8) NOT NULL,
    add_amount INT NOT NULL,
    FOREIGN KEY (p_id) REFERENCES product(p_id),
    FOREIGN KEY (added_by_e_id) REFERENCES employee(e_id)
);

CREATE TABLE training_session (
    ts_id CHAR(8) PRIMARY KEY NOT NULL,
    ts_start_time TIMESTAMP NOT NULL,
    ts_end_time TIMESTAMP,
    c_id CHAR(8) NOT NULL,
    FOREIGN KEY (c_id) REFERENCES customer(c_id)
);

CREATE TABLE personal_trainer_receipt (
    pt_id CHAR(8) NOT NULL,
    r_id CHAR(8) NOT NULL,
    ptr_price_per_hour DECIMAL(10,2) NOT NULL,
    ptr_hour_amount INT NOT NULL,
    ptr_discount DECIMAL(4,2) NOT NULL,
    PRIMARY KEY (pt_id, r_id),
    FOREIGN KEY (pt_id) REFERENCES personal_trainer(pt_id),
    FOREIGN KEY (r_id) REFERENCES receipt(r_id)
);

CREATE TABLE available_time (
    at_id CHAR(8) PRIMARY KEY NOT NULL,
    at_date DATE NOT NULL,
    at_start_time TIME NOT NULL,
    at_end_time TIME NOT NULL,
    pt_id CHAR(8) NOT NULL,
    c_id CHAR(8),
    UNIQUE (pt_id, at_date, at_start_time),
    FOREIGN KEY (pt_id) REFERENCES personal_trainer(pt_id),
    FOREIGN KEY (c_id) REFERENCES customer(c_id)
);

CREATE TABLE membership_type_receipt (
    mtr_id CHAR(8) PRIMARY KEY NOT NULL,
    mtr_price_per_month DECIMAL(10,2) NOT NULL,
    mtr_month_amount INT NOT NULL,
    mt_id CHAR(8) NOT NULL,
    r_id CHAR(8) NOT NULL,
    FOREIGN KEY (mt_id) REFERENCES membership_type(mt_id),
    FOREIGN KEY (r_id) REFERENCES receipt(r_id)
);

CREATE TABLE trainer_log(
	log_id SERIAL PRIMARY KEY,
	pt_id CHAR(8),
	added_by CHAR(8),
	log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW view_trainer_profile AS
SELECT
    pt.pt_id AS trainer_id,
    pt.pt_name AS name,
    pt.pt_alamat AS alamat,
    pt.pt_telephone AS telephone,
    pt.pt_gender AS gender,
    pt.pt_price_per_hour AS price_per_hour
FROM
    personal_trainer AS pt;


CREATE OR REPLACE VIEW view_employee_profile AS
SELECT
    e.e_id AS id,
    e.e_name AS name,
    e.e_alamat AS alamat,
    e.e_telephone AS telephone,
    e.e_gender AS gender
FROM
    employee AS e;


CREATE OR REPLACE VIEW view_customer_profile AS 
SELECT 
    c.c_id AS id,
    c.c_name AS name,
    c.c_email AS email,
    c.c_gender AS gender,
    mt.mt_name AS membership_type,
    m.m_telephone AS telephone,
    m.m_alamat AS alamat, 
    m.m_start_date AS start_date,
    m.m_expired_date AS expired_date
FROM customer c
NATURAL LEFT JOIN membership m
NATURAL LEFT JOIN membership_type mt;

CREATE OR REPLACE VIEW view_customer_on_gym AS
SELECT COUNT(DISTINCT c_id)  
FROM training_session
WHERE ts_end_time IS NULL AND ts_start_time > CURRENT_DATE + CURRENT_TIME;


CREATE OR REPLACE VIEW PRODUCT_TOTAL_DISCOUNT_OUTPUT AS
SELECT p_id, p_name, total_discount_output, (total_discount_output / total_raw_price) * 100.0 as discount_percent_from_total
FROM
	(SELECT p_id, p_name, SUM(raw_price_all) as total_raw_price, SUM(discount_output_all) as total_discount_output
	FROM
		(SELECT p_id, p_name, rp_price * rp_amount as raw_price_all, rp_price * rp_discount * rp_amount as discount_output_all
		FROM
			(SELECT p_id, p_name, rp_price, rp_amount, rp_discount
				FROM receipt_product
				NATURAL JOIN product))
	GROUP BY p_id, p_name);


CREATE OR REPLACE VIEW ALL_PEOPLE_ON_DATABASE AS
SELECT name, gender, CONCAT(role,
						   CASE WHEN SUB.mt_id IS NULL
						   THEN ''
						   ELSE CONCAT(' ', (SELECT(MT.mt_name) FROM membership_type MT WHERE MT.mt_id = SUB.mt_id))
						   END) as role
FROM
(SELECT c_name as name, c_gender as gender, 'Customer' as role, mt_id
	FROM customer
	NATURAL LEFT JOIN membership) SUB
UNION
SELECT e_name AS name, e_gender AS gender, 'Employee' AS role
FROM employee
UNION
SELECT pt_name AS name, pt_gender AS gender, 'Personal Trainer'
FROM personal_trainer;

CREATE OR REPLACE VIEW product_summary_sales AS
SELECT 
    p.p_id,
    p.p_name,
    COALESCE(SUM(rp.rp_amount), 0) AS total_unit_sold,
    COALESCE(SUM(rp.rp_amount * rp.rp_price * (1 - rp.rp_discount)), 0) AS total_revenue,
    (p.p_stock - COALESCE(SUM(rp.rp_amount), 0)) AS current_stock
FROM 
    product p
LEFT JOIN 
    receipt_product rp ON p.p_id = rp.p_id
GROUP BY 
    p.p_id, p.p_name, p.p_stock
ORDER BY 
    total_revenue DESC;

CREATE OR REPLACE VIEW membership_status_summary AS
SELECT 
	m.m_id,
	c.c_name,
	m.m_telephone,
	m.m_start_date,
	m.m_expired_date,
	mt.mt_name,
	CASE
		WHEN CURRENT_DATE BETWEEN m.m_start_date AND m.m_expired_date THEN 'active'
		ELSE 'expired'
	END AS status
FROM membership m
JOIN customer c ON c.c_id = m.c_id
JOIN membership_type as mt ON m.mt_id = mt.mt_id;

CREATE USER customer WITH PASSWORD 'pass123';
CREATE USER trainer WITH PASSWORD 'ptpass';
CREATE USER admin WITH PASSWORD 'adminpass';

-- customer
GRANT INSERT, SELECT ON training_session TO customer;
GRANT INSERT, SELECT ON customer TO customer;
GRANT INSERT, SELECT ON membership_type_receipt TO customer;
GRANT INSERT, SELECT ON receipt_product TO customer;
GRANT INSERT, SELECT ON personal_trainer_receipt TO customer;
GRANT INSERT, SELECT ON receipt TO customer;
GRANT INSERT, SELECT ON membership TO customer;

GRANT SELECT ON membership_type TO customer;
GRANT SELECT ON product TO customer;
GRANT SELECT ON personal_trainer TO customer;
GRANT SELECT ON available_time TO customer;
GRANT SELECT ON view_customer_on_gym TO customer;
GRANT SELECT ON view_customer_profile TO customer;

GRANT UPDATE ON available_time TO customer;
GRANT UPDATE ON training_session TO customer;
GRANT UPDATE ON receipt TO customer;
GRANT UPDATE ON product TO customer;

-- personal trainer
GRANT SELECT ON personal_trainer TO trainer;
GRANT SELECT ON available_time TO trainer;
GRANT SELECT ON customer TO trainer;
GRANT SELECT ON view_trainer_profile TO trainer;
GRANT SELECT ON personal_trainer_receipt TO trainer;

GRANT INSERT, UPDATE ON available_time TO trainer;

-- admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;


-- arya 
CREATE OR REPLACE FUNCTION format_nomor_telephone()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_TABLE_NAME = 'personal_trainer' THEN 
        IF SUBSTRING(NEW.pt_telephone, 1, 3) != '+62' THEN
            NEW.pt_telephone := '+62' || SUBSTRING(NEW.pt_telephone, 2, 15);
        END IF;
    ELSIF TG_TABLE_NAME = 'membership' THEN 
        IF SUBSTRING(NEW.m_telephone, 1, 3) != '+62' THEN
            NEW.m_telephone := '+62' || SUBSTRING(NEW.m_telephone, 2, 15);
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_formatting_telephone
BEFORE INSERT ON personal_trainer
FOR EACH ROW
EXECUTE FUNCTION format_nomor_telephone();

CREATE OR REPLACE TRIGGER trg_formatting_telephone
BEFORE INSERT ON membership
FOR EACH ROW
EXECUTE FUNCTION format_nomor_telephone();

CREATE OR REPLACE FUNCTION increment_id(
    last_id CHAR, 
    prefix CHAR
)
RETURNS CHAR 
LANGUAGE plpgsql
AS $$
DECLARE
    new_id_num INT;
    prefix_len INT;
BEGIN
    prefix_len := CHAR_LENGTH(prefix);

    IF last_id IS NULL THEN 
        new_id_num := 1;
    ELSE 
        new_id_num := CAST(SUBSTRING(last_id, prefix_len + 1) AS INT) + 1;
    END IF;

    RETURN CONCAT(prefix, LPAD(new_id_num::text, 8 - prefix_len, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION set_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    last_id CHAR(8);
BEGIN
    IF TG_TABLE_NAME = 'customer' THEN
        SELECT MAX(c_id) INTO last_id FROM customer;
        NEW.c_id := increment_id(last_id, 'C');
    ELSIF TG_TABLE_NAME = 'employee' THEN
        SELECT MAX(e_id) INTO last_id FROM employee;
        NEW.e_id := increment_id(last_id, 'E');
    ELSIF TG_TABLE_NAME = 'personal_trainer' THEN
        SELECT MAX(pt_id) INTO last_id FROM personal_trainer;
        NEW.pt_id := increment_id(last_id, 'PT');
    ELSIF TG_TABLE_NAME = 'product' THEN
        SELECT MAX(p_id) INTO last_id FROM product;
        NEW.p_id := increment_id(last_id, 'P');
    ELSIF TG_TABLE_NAME = 'training_session' THEN
        SELECT MAX(ts_id) INTO last_id FROM training_session;
        NEW.ts_id := increment_id(last_id, 'TS');
    ELSIF TG_TABLE_NAME = 'available_time' THEN
        SELECT MAX(at_id) INTO last_id FROM available_time;
        NEW.at_id := increment_id(last_id, 'AT');    
    ELSIF TG_TABLE_NAME = 'receipt' THEN
        SELECT MAX(r_id) INTO last_id FROM receipt;
        NEW.r_id := increment_id(last_id, 'R');    
    ELSIF TG_TABLE_NAME = 'membership_type' THEN
        SELECT MAX(mt_id) INTO last_id FROM membership_type;
        NEW.mt_id := increment_id(last_id, 'MT');    
    ELSIF TG_TABLE_NAME = 'membership' THEN
        SELECT MAX(m_id) INTO last_id FROM membership;
        NEW.m_id := increment_id(last_id, 'M');
    ELSIF TG_TABLE_NAME = 'membership_type_receipt' THEN
        SELECT MAX(mtr_id) INTO last_id FROM membership_type_receipt;
        NEW.mtr_id := increment_id(last_id, 'MTR'); 
    ELSIF TG_TABLE_NAME = 'product_employee' THEN
        SELECT MAX(pe_id) INTO last_id FROM product_employee;
        NEW.pe_id := increment_id(last_id, 'PE'); 
    END IF; 

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON membership
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON membership_type
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON receipt
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON available_time
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON customer
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON personal_trainer
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON employee
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON product
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON training_session
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON membership_type_receipt
FOR EACH ROW
EXECUTE FUNCTION set_id();

CREATE OR REPLACE TRIGGER tgr_id_before_insert
BEFORE INSERT ON product_employee
FOR EACH ROW
EXECUTE FUNCTION set_id();


-- fajar 
CREATE OR REPLACE FUNCTION ADD_TO_STOCK()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN
	UPDATE product
		SET p_stock = p_stock + NEW.add_amount
		WHERE p_id = NEW.p_id;
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER UPDATE_STOCK_PRODUCT
AFTER INSERT ON product_employee
FOR EACH ROW
EXECUTE PROCEDURE
ADD_TO_STOCK();

CREATE OR REPLACE FUNCTION PROCESS_PRODUCT_RECEIPT()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
DECLARE
	customer_id CHAR(8);
	membership_type_id CHAR(8);
	membership_type_name VARCHAR(64);
	discount_product DECIMAL(4, 2);
BEGIN
	SELECT c_id INTO customer_id FROM receipt WHERE r_id = NEW.r_id;
	SELECT mt_id INTO membership_type_id FROM membership MB WHERE MB.c_id = customer_id;
	
	IF membership_type_id IS NOT NULL THEN
		SELECT mt_name INTO membership_type_name FROM membership_type MT WHERE MT.mt_id = membership_type_id;
		
		IF CURRENT_DATE < (SELECT m_start_date FROM membership MB WHERE mb.c_id = customer_id)
		OR
		CURRENT_DATE > (SELECT m_expired_date FROM membership MB WHERE mb.c_id = customer_id) THEN
			membership_type_id := NULL;
			membership_type_name := NULL;
		END IF;
	END IF;
	
	discount_product := 0.0;
	
	IF membership_type_name IS NOT NULL THEN
		IF membership_type_name = 'Bronze' THEN
			discount_product := 0.1;
		ELSIF membership_type_name = 'Silver' THEN
			discount_product := 0.2;
		ELSIF membership_type_name = 'Gold' THEN
			discount_product := 0.3;
		END IF;
	END IF;
	
	NEW.rp_discount := discount_product;
	
	SELECT p_price INTO NEW.rp_price
		FROM product PROD WHERE PROD.p_id = NEW.p_id;
	
	UPDATE receipt
		SET r_final_price = r_final_price + (NEW.rp_price * (1.0 - NEW.rp_discount) * NEW.rp_amount)
		WHERE r_id = NEW.r_id;
	
	UPDATE product
		SET p_stock = p_stock - NEW.rp_amount
		WHERE p_id = NEW.p_id;
		
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER UPDATE_RECEIPT_TOTAL_PRICE_PRODUCT
BEFORE INSERT ON receipt_product
FOR EACH ROW
EXECUTE PROCEDURE
PROCESS_PRODUCT_RECEIPT();


CREATE OR REPLACE FUNCTION REVENUE_ON_AND_GENDER(on_date DATE, on_gender CHAR(1))
RETURNS DECIMAL(10, 2)
LANGUAGE PLPGSQL
AS
$$
DECLARE
	total_revenue DECIMAL(10, 2);
BEGIN
	SELECT SUM(r_final_price) INTO total_revenue
	FROM
	(SELECT cust.c_gender, rec.r_id, rec.c_id, rec.r_date, rec.r_final_price
		FROM receipt rec
		NATURAL JOIN customer cust
		WHERE cust.c_gender = on_gender AND DATE(rec.r_date) = on_date);
		
	RETURN total_revenue;
END;
$$;

CREATE OR REPLACE FUNCTION PERCENTAGE_ADD_ON_PRODUCT_BY_EMPLOYEE(product_id CHAR(8))
RETURNS TABLE(added_by_e_id CHAR(8), add_percentage DECIMAL(10, 2))
LANGUAGE PLPGSQL
AS
$$
DECLARE
	add_total BIGINT;
BEGIN
	SELECT SUM(pe.add_amount) INTO add_total
	FROM product_employee pe
		WHERE pe.p_id = product_id;

	RETURN QUERY
	SELECT pe.added_by_e_id, SUM(pe.add_percentage) * 100.0 as add_percentage
	FROM
		(SELECT pe.added_by_e_id, CAST(add_amount AS DECIMAL(10, 2)) / CAST(add_total AS DECIMAL(10, 2)) as add_percentage
		FROM product_employee pe
			WHERE pe.p_id = product_id
		UNION
		SELECT e_id as added_by_e_id, 0.0 as add_percentage
		FROM employee) pe
	GROUP BY pe.added_by_e_id
	ORDER BY add_percentage DESC;
END;
$$;

-- Ryan
CREATE OR REPLACE FUNCTION process_personal_trainer_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
DECLARE
	membership_type_id CHAR(8);
	membership_type_name VARCHAR(64);
	discount DECIMAL(4, 2);
BEGIN
	SELECT mt_id INTO membership_type_id 
	FROM membership as m
	WHERE m.c_id = (
		SELECT c_id from receipt WHERE r_id = NEW.r_id
	);

	IF membership_type_id IS NOT NULL THEN
        SELECT mt_name INTO membership_type_name
        FROM membership_type MT
        WHERE MT.mt_id = membership_type_id;
    END IF;

	discount := 0.0;
	
	IF membership_type_name IS NOT NULL THEN
		IF membership_type_name = 'Bronze' THEN
			discount = 0.1;
		ELSIF membership_type_name = 'Silver' THEN
			discount = 0.2;
		ELSIF membership_type_name = 'Gold' THEN
			discount = 0.3;
		END IF;
	END IF;

	NEW.ptr_discount := discount;

	UPDATE receipt
	SET r_final_price = r_final_price + (NEW.ptr_price_per_hour * NEW.ptr_hour_amount) * (1 - NEW.ptr_discount)
	WHERE r_id = NEW.r_id;

	RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION log_new_trainer()
RETURNS TRIGGER
AS $$

BEGIN
	INSERT INTO trainer_log(pt_id, added_by)
	VALUES(NEW.pt_id, NEW.added_by_e_id);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_new_trainer
AFTER INSERT ON personal_trainer
FOR EACH ROW
EXECUTE FUNCTION log_new_trainer();

CREATE OR REPLACE TRIGGER trg_update_receipt_pt
BEFORE INSERT ON personal_trainer_receipt
FOR EACH ROW
EXECUTE PROCEDURE process_personal_trainer_receipt();

CREATE OR REPLACE FUNCTION get_total_spending(customer_id CHAR(8))
RETURNS DECIMAL(10, 2)
AS $$

BEGIN
	RETURN(
		SELECT COALESCE(SUM(r.r_final_price), 0)
		FROM receipt AS r
		WHERE r.c_id = customer_id
	);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_trainer_income(trainer_id CHAR(8))
RETURNS DECIMAL(10, 2)
AS $$
DECLARE
    total_income DECIMAL(10, 2);
BEGIN
    SELECT SUM(
        (ptr_price_per_hour * ptr_hour_amount) * (1 - COALESCE(ptr_discount, 0))
    ) INTO total_income
    FROM personal_trainer_receipt
    WHERE pt_id = trainer_id;

    RETURN COALESCE(total_income, 0);
END;
$$ LANGUAGE plpgsql;

-- randi 


CREATE OR REPLACE FUNCTION cegah_sesi_member_tidak_aktif()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_expired_date DATE;
    v_customer_name VARCHAR;
BEGIN
    SELECT m.m_expired_date, c.c_name 
    INTO v_expired_date, v_customer_name
    FROM customer c
    LEFT JOIN membership m ON c.c_id = m.c_id
    WHERE c.c_id = NEW.c_id;

    IF v_expired_date IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Customer "%" (%) tidak memiliki membership.', v_customer_name, NEW.c_id;
    END IF;

    IF NEW.ts_start_time > v_expired_date THEN
        RAISE EXCEPTION 'Akses ditolak: Membership customer "%" (%) telah kedaluwarsa pada tanggal %.', 
            v_customer_name, NEW.c_id, TO_CHAR(v_expired_date, 'DD-Mon-YYYY');
    END IF;

    RETURN NEW;
END;
$$;


CREATE OR REPLACE TRIGGER trg_validasi_membership_sebelum_sesi
BEFORE INSERT ON training_session
FOR EACH ROW
EXECUTE FUNCTION cegah_sesi_member_tidak_aktif();

CREATE OR REPLACE FUNCTION update_receipt_final_price_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_membership_total_price DECIMAL(10,2);
BEGIN
    v_membership_total_price := NEW.mtr_price_per_month * NEW.mtr_month_amount;

    UPDATE receipt
    SET 
        r_final_price = r_final_price + v_membership_total_price
    WHERE 
        r_id = NEW.r_id;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_update_final_price_on_membership
AFTER INSERT ON membership_type_receipt
FOR EACH ROW
EXECUTE FUNCTION update_receipt_final_price_membership();

CREATE OR REPLACE FUNCTION hitung_total_jam_training_customer(p_customer_id CHAR(8))
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_interval INTERVAL;
    v_total_hours INT;
    v_total_minutes INT;
BEGIN
    SELECT 
        SUM(ts_end_time - ts_start_time)
    INTO 
        v_total_interval
    FROM 
        training_session
    WHERE 
        c_id = p_customer_id AND ts_end_time IS NOT NULL;

    IF v_total_interval IS NULL THEN
        RETURN '0 Jam, 0 Menit';
    END IF;

    v_total_hours := FLOOR(EXTRACT(EPOCH FROM v_total_interval) / 3600);
    v_total_minutes := FLOOR((EXTRACT(EPOCH FROM v_total_interval) / 60) % 60);

    RETURN v_total_hours || ' Jam, ' || v_total_minutes || ' Menit';
END;
$$;

CREATE OR REPLACE FUNCTION hitung_streak_training_customer(p_customer_id CHAR(8))
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_streak INT := 0;
    v_last_training_date DATE;
    v_expected_date DATE;
    v_training_date RECORD;
BEGIN
    SELECT MAX(ts_start_time::date) INTO v_last_training_date
    FROM training_session
    WHERE c_id = p_customer_id;

    IF v_last_training_date IS NULL THEN
        RETURN 0;
    END IF;

    IF v_last_training_date < (CURRENT_DATE - INTERVAL '1 day') THEN
        RETURN 0;
    END IF;

    v_expected_date := v_last_training_date;

    FOR v_training_date IN (
        SELECT DISTINCT ts_start_time::date AS a_date
        FROM training_session
        WHERE c_id = p_customer_id
        ORDER BY a_date DESC
    ) 
    LOOP
        IF v_training_date.a_date = v_expected_date THEN
            v_streak := v_streak + 1;
            v_expected_date := v_expected_date - 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;

    RETURN v_streak;
END;
$$;

