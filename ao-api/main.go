package main

import (
	"log"
	"os"

	"github.com/dotenx/dotenx/ao-api/app"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/joho/godotenv"
)

func init() {
	log.SetFlags(log.Llongfile)
	err := bootstrap()
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
}

func main() {
	//_, err := ioutil.ReadFile("./_data/test.json")
	//if err != nil {
	/*()	fmt.Print(err)
	}
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Successfully Opened users.json")*/
	// defer the closing of our jsonFile so that we can parse it later on
	app := app.NewApp()
	log.Fatalln(app.Start(":" + config.Configs.App.Port))
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
