FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY *.go ./

RUN go build -o ./dropbox-new-file

FROM alpine 

COPY --from=build /app/dropbox-new-file ./

CMD [ "/dropbox-new-file" ]