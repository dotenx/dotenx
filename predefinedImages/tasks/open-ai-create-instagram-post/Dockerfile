FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./open-ai-create-instagram-post

FROM alpine 

COPY --from=build /app/open-ai-create-instagram-post ./

CMD [ "/open-ai-create-instagram-post" ]