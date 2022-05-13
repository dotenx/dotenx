FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY *.go ./

RUN go build -o ./publish-post

FROM alpine 

COPY --from=build /app/publish-post ./

CMD [ "/publish-post" ]