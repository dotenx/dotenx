FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY *.go ./

RUN go build -o ./feed-new-post

FROM alpine 

COPY --from=build /app/feed-new-post ./

CMD [ "/feed-new-post" ]