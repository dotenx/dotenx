FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./new-sale

FROM alpine 

COPY --from=build /app/new-sale ./

CMD [ "/new-sale" ]