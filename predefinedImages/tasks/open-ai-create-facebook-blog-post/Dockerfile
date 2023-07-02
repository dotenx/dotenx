FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./open-ai-create-facebook-blog-post

FROM alpine 

COPY --from=build /app/open-ai-create-facebook-blog-post ./

CMD [ "/open-ai-create-facebook-blog-post" ]