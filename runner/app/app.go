package app

import (
	"crypto/tls"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/joho/godotenv"
	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/grpcClient"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/services"
	"github.com/utopiops/automated-ops/runner/shared"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

func StartApp() {
	err := bootstrap()
	shared.FailOnError(err, "Failed to bootstrap")

	httpHelper := shared.NewHttpHelper(shared.NewHttpClient())
	authHelper := shared.AuthHelper{
		HttpHelper: httpHelper,
	}
	logHelper := shared.NewLogHelper(authHelper, httpHelper)
	//err = register(authHelper)
	//shared.FailOnError(err, "Failed to bootstrap")
	//jobSvc := services.NewJobService(authHelper, httpHelper)
	taskChan := make(chan models.Task, 1000)
	grpcClient, err := setGrpcClient(config.Configs.Endpoints.AoBridge)
	if err != nil {
		panic(err)
	}
	var clientId string
	fmt.Print("ClientId: ")
	fmt.Scan(&clientId)
	go services.StartReceiving(grpcClient, clientId, taskChan)
	for task := range taskChan {
		go services.HandleJob(grpcClient, task, logHelper)
	}
}

func bootstrap() error {
	err := godotenv.Load()
	if err != nil {
		return err
	}
	err = config.Load()
	if err != nil {
		return err
	}
	log.Println("Environment variables loaded...")
	return nil
}

func register(auth shared.AuthHelper) (err error) {
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		err = auth.Register()
	}()
	wg.Wait()
	if err != nil {
		fmt.Println("Registration failed.")
	} else {
		fmt.Println("Registration successfull.")
	}
	return
}

func setGrpcClient(serverAddress string) (grpcClient.JobStreamServiceClient, error) {
	creds := credentials.NewTLS(&tls.Config{})
	cc, err := grpc.Dial(serverAddress, grpc.WithTransportCredentials(creds), grpc.WithBlock(), grpc.WithTimeout(time.Duration(10)*time.Second))
	if err != nil {
		log.Fatalf("could not connect to server: %v", err)
		return nil, err
	}
	//defer cc.Close()
	c := grpcClient.NewJobStreamServiceClient(cc)
	return c, nil
}
