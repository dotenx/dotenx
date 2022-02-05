package app

import (
	"fmt"
	"log"
	"sync"

	"github.com/joho/godotenv"
	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/services/jobService"
	"github.com/utopiops/automated-ops/runner/shared"
)

func StartApp() {
	err := bootstrap()
	shared.FailOnError(err, "Failed to bootstrap")
	httpHelper := shared.NewHttpHelper(shared.NewHttpClient())
	authHelper := shared.AuthHelper{
		HttpHelper: httpHelper,
	}
	err = register(authHelper)
	shared.FailOnError(err, "Failed to register")
	logHelper := shared.NewLogHelper(authHelper, httpHelper)
	service := jobService.NewService(httpHelper, logHelper)
	jobChan := make(chan models.Job, 1000)
	go service.StartReceiving(jobChan)
	for task := range jobChan {
		go service.HandleJob(task, logHelper)
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
