#!/bin/bash

s3_url="s3://${BUCKET_NAME}/${CSV_FILE_NAME}"
aws s3 cp ${s3_url} ${CSV_FILE_NAME}

read -r first_line<${CSV_FILE_NAME}
psql -h db.dotenx.com -p 5432 -d $DB_NAME -U $DB_USERNAME -w -c "\copy ${TABLE_NAME}(${first_line}) FROM '${CSV_FILE_NAME}' DELIMITER ',' CSV HEADER;"

aws s3 rm ${s3_url}
