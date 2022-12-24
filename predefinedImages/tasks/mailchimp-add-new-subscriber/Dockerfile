FROM golang:1.18-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./add-subscriber

FROM alpine 

COPY --from=build /app/add-subscriber ./

CMD [ "/add-subscriber" ]