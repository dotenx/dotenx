FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./stripe-update-product

FROM alpine 

COPY --from=build /app/stripe-update-product ./

CMD [ "/stripe-update-product" ]