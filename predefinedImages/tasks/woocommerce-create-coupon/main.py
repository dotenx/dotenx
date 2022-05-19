from matplotlib import category
from numpy import percentile
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

code = os.environ['COUPON_CODE']
type = os.environ['COUPON_DISCOUNT_TYPE']
amount = os.environ['COUPON_AMOUNT']
individual_use = os.environ['COUPON_INDIVIDUAL_USE'].lower() in ['true', '1', 't', 'y', 'yes', 'yeah', 'yup', 'certainly']
exclude_sale_items = os.environ['COUPON_EXCLUDE_SALE_ITEMS'].lower() in ['true', '1', 't', 'y', 'yes', 'yeah', 'yup', 'certainly']
minimum_amount = os.environ['COUPON_MINIMUM_AMOUNT']
data = {
    "code": code,
    "discount_type": type,
    "amount": amount,
    "individual_use": individual_use,
    "exclude_sale_items": exclude_sale_items,
    "minimum_amount": minimum_amount,
}

result = wcapi.post("coupons", data)
print(result.json())