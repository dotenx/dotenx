package app

import (
	"fmt"
	"sync"

	"github.com/dotenx/dotenx/runner/config"
	"github.com/dotenx/dotenx/runner/models"
	"github.com/dotenx/dotenx/runner/services/jobService"
	"github.com/dotenx/dotenx/runner/shared"
	"github.com/joho/godotenv"
)

func StartApp() {
	// hi from armin
	err := bootstrap()
	shared.FailOnError(err, "Failed to bootstrap")
	httpHelper := shared.NewHttpHelper(shared.NewHttpClient())
	authHelper := shared.AuthHelper{
		HttpHelper: httpHelper,
	}
	//err = register(authHelper)
	//shared.FailOnError(err, "Failed to register")
	logHelper := shared.NewLogHelper(authHelper, httpHelper)
	service := jobService.NewService(httpHelper, logHelper)
	jobChan := make(chan models.Job, 1000)
	go service.StartReceiving(jobChan)
	fmt.Println("listening for jobs...")
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
	//log.Println("Environment variables loaded...")
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
