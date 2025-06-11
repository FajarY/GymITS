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
    p_id CHAR(8) NOT NULL,
    added_by_e_id CHAR(8) NOT NULL,
    add_amount INT NOT NULL,
    PRIMARY KEY (p_id, added_by_e_id),
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