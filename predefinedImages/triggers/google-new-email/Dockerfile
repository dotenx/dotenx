FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN go build -o ./google-new-email

FROM alpine 

COPY --from=build /app/google-new-email ./

CMD [ "./google-new-email" ]