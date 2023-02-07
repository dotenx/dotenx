FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./sendgrid-send-email

FROM alpine 

COPY --from=build /app/sendgrid-send-email ./

CMD [ "/sendgrid-send-email" ]