CREATE DATABASE template_base
WITH IS_TEMPLATE TRUE;



-- TODO: Add checks
CREATE DOMAIN yes_no AS BOOLEAN;
CREATE DOMAIN image_address AS VARCHAR;
CREATE DOMAIN file_address AS VARCHAR;
CREATE DOMAIN rating AS int;
CREATE DOMAIN url AS VARCHAR;
CREATE DOMAIN email AS VARCHAR;
CREATE DOMAIN just_time AS TIME;
CREATE DOMAIN just_date AS DATE;
CREATE DOMAIN date_time AS DATE;
CREATE DOMAIN num AS int;
CREATE DOMAIN short_text AS VARCHAR;
CREATE DOMAIN long_text AS TEXT;
CREATE DOMAIN link_field AS int;