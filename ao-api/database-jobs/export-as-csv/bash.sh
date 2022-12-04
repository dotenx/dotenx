#!/bin/bash

mkdir -p "$DB_NAME"
echo "Fetching table list ..."
psql -h db.dotenx.com -p 5432 -d $DB_NAME -U d10xusr -w -c "copy (select table_name from information_schema.tables where table_schema='public') to STDOUT;" > "$DB_NAME/tables.txt"

echo "Fetching tables ..."
readarray tables < "$DB_NAME/tables.txt"
for t in ${tables[*]}; do
	file_address="./$DB_NAME/$t.csv"
	psql -h db.dotenx.com -p 5432 -d "$DB_NAME" -U d10xusr -w -c "copy $t to stdout with delimiter ',' csv header;" > ${file_address}
done

cd $DB_NAME
zip -r $DB_NAME.zip .

rand_str=$(openssl rand -hex 16)
s3_url="s3://${BUCKET_NAME}/${PROJECT_NAME}_${rand_str}.zip"
aws s3 cp $DB_NAME.zip ${s3_url}

dest_url=$(aws s3 presign ${s3_url} --expires-in 21600)
exp_time=$(( 21600 + $(date '+%s') ))
psql -h db.dotenx.com -p 5432 -d api -U d10xusr -w -c "UPDATE database_jobs SET csv_url='${dest_url}', csv_url_expiration_time=${exp_time}, csv_status='completed' WHERE account_id='${ACCOUNT_ID}' AND project_name='${PROJECT_NAME}'" -A
