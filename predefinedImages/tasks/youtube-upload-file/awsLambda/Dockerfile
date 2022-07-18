FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN go build -o ./youtube-upload-file

FROM alpine 

COPY --from=build /app/youtube-upload-file ./

CMD [ "./youtube-upload-file" ]