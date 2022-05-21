from woocommerce import API
import os

url = os.environ['WEBSITE_URL']
consumer_key = os.environ['CONSUMER_KEY']
consumer_secret = os.environ['CONSUMER_SECRET']


wcapi = API(
    url=url,
    consumer_key=consumer_key,
    consumer_secret=consumer_secret,
    version="wc/v3"
)

email = os.environ['CUSTOMER_EMAIL']
first_name = os.environ['CUSTOMER_FIRST_NAME']
last_name = os.environ['CUSTOMER_LAST_NAME']
username = os.environ['CUSTOMER_USERNAME']
address_1 = os.environ['CUSTOMER_ADDRESS_1']
city = os.environ['CUSTOMER_CITY']
state = os.environ['CUSTOMER_STATE']
postcode = os.environ['CUSTOMER_POSTCODE']
country = os.environ['CUSTOMER_COUNTRY']
phone = os.environ['CUSTOMER_PHONE']

data = {
    "email": email,
    "first_name": first_name,
    "last_name": last_name,
    "username": username,
    "billing": {
        "first_name": first_name,
        "last_name": last_name,
        "company": "",
        "address_1": address_1,
        "address_2": "",
        "city": city,
        "state": state,
        "postcode": postcode,
        "country": country,
        "email": email,
        "phone": phone
    },
    "shipping": {
        "first_name": first_name,
        "last_name": last_name,
        "company": "",
        "address_1": address_1,
        "address_2": "",
        "city": city,
        "state": state,
        "postcode": postcode,
        "country": country,
    }
}
result = wcapi.post("customers", data)
print(result.json())