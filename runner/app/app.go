package app

import (
	"fmt"
	"log"
	"sync"

	"github.com/joho/godotenv"
	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/services"
	"github.com/utopiops/automated-ops/runner/shared"
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
	if err != nil {
		panic(err)
	}
	var clientId string
	fmt.Print("ClientId: ")
	fmt.Scan(&clientId)
	go services.StartReceiving(clientId, taskChan)
	for task := range taskChan {
		go services.HandleJob(task, logHelper)
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
