# docker pull hawwwdi/send-discord-message
# docker pull awrmin/utopiopshttpcall
# docker pull awrmin/read-file
# docker pull awrmin/write-file
# docker pull hojjat12/facebook-publish-post:latest
# docker pull awrmin/add_gitlab_members
# docker pull awrmin/remove_gitlab_members
# docker pull hojjat12/google-send-email:latest
# docker pull awrmin/create-jira-ticket
# docker pull awrmin/sendemail
# docker pull awrmin/slack-send-message
# docker pull hawwwdi/stripe-create-customer:latest
# docker pull hawwwdi/stripe-find-customer:latest
# docker pull hawwwdi/stripe-update-customer:latest
# docker pull hojjat12/twitter-send-tweet:latest
# docker pull hawwwdi/woocommerce-create-coupon:latest
# docker pull hawwwdi/woocommerce-create-customer:latest
# docker pull hawwwdi/woocommerce-create-product:latest
# docker pull hojjat12/youtube-upload-file:latest
# docker pull hojjat12/dropbox-upload-new-file:latest
# docker pull hojjat12/facebook-publish-new-post:latest
# docker pull hojjat12/google-new-email:latest
# docker pull awrmin/slack-new-message
# docker pull hawwwdi/stripe-new-invoice
# docker pull hawwwdi/stripe-payment-completed
# docker pull hojjat12/twitter-new-tweet:latest
# docker pull hawwwdi/woocommerce-new-order

mv ao-api/.env.production ao-api/.env
mv runner/.env.production runner/.env
mv ui/.env.prod ui/.env.production
# docker-compose build ui
# docker-compose build ao-api
# docker-compose build runner
# docker-compose build scheduler_server
docker-compose up --build
