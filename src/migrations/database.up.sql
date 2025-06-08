CREATE TABLE employee (
    e_id CHAR(8) PRIMARY KEY,
    e_name VARCHAR(128),
    e_password VARCHAR(60),
    e_alamat VARCHAR(256),
    e_telephone VARCHAR(16),
    e_gender CHAR(1)
);

CREATE TABLE personal_trainer (
    pt_id CHAR(8) PRIMARY KEY,
    pt_name VARCHAR(128),
    pt_alamat VARCHAR(256),
    pt_password VARCHAR(60),
    pt_telephone VARCHAR(16),
    pt_gender CHAR(1),
    pt_price_per_hour DECIMAL(10,2),
    added_by_e_id CHAR(8),
    FOREIGN KEY (added_by_e_id) REFERENCES employee(e_id)
);

CREATE TABLE customer (
    c_id CHAR(8) PRIMARY KEY,
    c_name VARCHAR(128),
    c_gender CHAR(1),
    c_email VARCHAR(64),
    c_password VARCHAR(60)
);

CREATE TABLE product (
    p_id CHAR(12) PRIMARY KEY,
    p_name VARCHAR(128),
    p_price DECIMAL(10,2),
    p_stock INT
);

CREATE TABLE membership_type (
    mt_id CHAR(8) PRIMARY KEY,
    mt_name VARCHAR(64),
    mt_price_per_month DECIMAL(10,2)
);

CREATE TABLE membership (
    m_id CHAR(8) PRIMARY KEY,
    m_telephone VARCHAR(16),
    m_alamat VARCHAR(256),
    m_start_date DATE,
    m_expired_date DATE,
    c_id CHAR(8),
    mt_id CHAR(8),
    FOREIGN KEY (c_id) REFERENCES customer(c_id),
    FOREIGN KEY (mt_id) REFERENCES membership_type(mt_id)
);

CREATE TABLE receipt (
    r_id CHAR(12) PRIMARY KEY,
    r_date TIMESTAMP,
    r_final_price DECIMAL(10,2),
    c_id CHAR(8),
    FOREIGN KEY (c_id) REFERENCES customer(c_id)
);

CREATE TABLE receipt_product (
    r_id CHAR(12),
    p_id CHAR(12),
    rp_price DECIMAL(10,2),
    rp_amount INT,
    rp_discount DECIMAL(10,2),
    PRIMARY KEY (r_id, p_id),
    FOREIGN KEY (r_id) REFERENCES receipt(r_id),
    FOREIGN KEY (p_id) REFERENCES product(p_id)
);

CREATE TABLE product_employee (
    p_id CHAR(12),
    added_by_e_id CHAR(8),
    add_amount INT,
    PRIMARY KEY (p_id, added_by_e_id),
    FOREIGN KEY (p_id) REFERENCES product(p_id),
    FOREIGN KEY (added_by_e_id) REFERENCES employee(e_id)
);

CREATE TABLE training_session (
    ts_id CHAR(12) PRIMARY KEY,
    ts_start_time TIMESTAMP,
    ts_end_time TIMESTAMP,
    c_id CHAR(8),
    FOREIGN KEY (c_id) REFERENCES customer(c_id)
);

CREATE TABLE personal_trainer_appointment (
    pt_a_id CHAR(12) PRIMARY KEY,
    pt_a_date DATE,
    c_id CHAR(8),
    pt_id CHAR(8),
    pt_start_end_time TSRANGE,
    FOREIGN KEY (c_id) REFERENCES customer(c_id),
    FOREIGN KEY (pt_id) REFERENCES personal_trainer(pt_id)
);

CREATE TABLE personal_trainer_receipt (
    pt_id CHAR(8),
    r_id CHAR(12),
    ptr_price_per_hour DECIMAL(10,2),
    ptr_hour_amount INT,
    ptr_discount DECIMAL(4,2),
    PRIMARY KEY (pt_id, r_id),
    FOREIGN KEY (pt_id) REFERENCES personal_trainer(pt_id),
    FOREIGN KEY (r_id) REFERENCES receipt(r_id)
);

CREATE TABLE available_time (
    at_id CHAR(12) PRIMARY KEY,
    at_date DATE,
    pt_id CHAR(8),
    at_start_end_time TSRANGE,
    FOREIGN KEY (pt_id) REFERENCES personal_trainer(pt_id)
);

CREATE TABLE membership_type_receipt (
    mtr_id INT PRIMARY KEY,
    mtr_price_per_month DECIMAL(10,2),
    mtr_month_amount INT,
    mt_id CHAR(8),
    FOREIGN KEY (mt_id) REFERENCES membership_type(mt_id)
);
