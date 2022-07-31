package main

import (
	"log"

	"github.com/dotenx/dotenx/ao-api/config"

	"github.com/dotenx/dotenx/ao-api/app"
)

// TODO: The environment variables are loaded into structs in an unreliable way. FIX IT ASAP.
func main() {

	app := app.NewApp()
	log.Fatalln(app.Start(":" + config.Configs.App.Port))
}
