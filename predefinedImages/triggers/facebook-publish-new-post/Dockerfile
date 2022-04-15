FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY *.go ./

RUN go build -o ./publish-new-post

FROM alpine 

COPY --from=build /app/publish-new-post ./

CMD [ "/publish-new-post" ]