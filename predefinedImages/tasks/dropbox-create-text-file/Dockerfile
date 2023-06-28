FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./dropbox-create-text-file

FROM alpine 

COPY --from=build /app/dropbox-create-text-file ./

CMD [ "/dropbox-create-text-file" ]