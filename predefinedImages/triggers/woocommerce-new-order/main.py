from woocommerce import API
import os
import datetime
import requests

url = os.environ['WEBSITE_URL']
consumer_key = os.environ['CONSUMER_KEY']
consumer_secret = os.environ['CONSUMER_SECRET']


wcapi = API(
    url=url,
    consumer_key=consumer_key,
    consumer_secret=consumer_secret,
    version="wc/v3"
)

pipeline_endpoint = os.environ['PIPELINE_ENDPOINT']
workspace = os.environ['WORKSPACE']
trigger = os.environ['TRIGGER_NAME']
passedSeconds = int(os.environ['passed_seconds'])

start = datetime.datetime.fromtimestamp(datetime.datetime.utcnow().timestamp()-passedSeconds).isoformat()
result = wcapi.get("orders", after=start).json()

#id, total, customer_email, status 
if len(result) == 0:
    print("no order found")
    exit(0)

id = result[0]['id']
total = result[0]['total']
status = result[0]['status']
customer_email = result[0]['billing']['email']

body = f'{ workspace:{workspace}, {trigger}:{id:{id}, total:{total}, customer_email:{customer_email}, status:{status}}}'
requests.post(url=pipeline_endpoint, data=body)