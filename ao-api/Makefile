SRC=.

all: run

run:
	go run main.go

.PHONY: build
build: main

main: $(wilcard $(SRC)/*)
	go build main.go

.PHONY: test
test:
	go test ./...

.PHONY: test_cover
test_cover:
	go test -cover ./...

.PHONY: docker_run
docker_run: 
	docker-compose up

.PHONY: docker_build
docker_build: dockerized_build

dockerized_build: $(wilcard $(SRC)/*)
	docker build . -t ao-api

