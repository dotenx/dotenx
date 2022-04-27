FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./google-send-email

FROM alpine 

COPY --from=build /app/google-send-email ./

CMD [ "/google-send-email" ]