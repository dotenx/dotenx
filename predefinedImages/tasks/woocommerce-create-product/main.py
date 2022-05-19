from matplotlib import category
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

name = os.environ['PRODUCT_NAME']
type = os.environ['PRODUCT_TYPE']
price = os.environ['PRODUCT_PRICE']
description = os.environ['PRODUCT_DESCRIPTION']
short_description = os.environ['PRODUCT_SHORT_DESCRIPTION']
catgory = os.environ['PRODUCT_CATEGORY']
image = os.environ['PRODUCT_IMAGE']

data = {
    "name": name,
    "type": type,
    "regular_price": price,
    "description": description,
    "short_description": short_description,
    "categories": [
        {
            "id": catgory
        }
    ],
    "images": [
        {
            "src": image
        }
    ]
}

result = wcapi.post("products", data)
print(result.json())