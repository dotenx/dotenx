#!/bin/bash

pg_dump -h db.dotenx.com -p 5432 -d ${DB_NAME} -U d10xusr -w > db.dump

rand_str=$(openssl rand -hex 16)
s3_url="s3://${BUCKET_NAME}/dmp_${rand_str}.dump"
aws s3 cp db.dump ${s3_url}

dest_url=$(aws s3 presign ${s3_url} --expires-in 21600)

exp_time=$(( 21600 + $(date '+%s') ))

psql -h db.dotenx.com -p 5432 -d api -U d10xusr -w -c "UPDATE database_jobs SET pg_dump_url='${dest_url}', pg_dump_url_expiration_time=${exp_time}, pg_dump_status='completed' WHERE account_id='${ACCOUNT_ID}' AND project_name='${PROJECT_NAME}'" -A
