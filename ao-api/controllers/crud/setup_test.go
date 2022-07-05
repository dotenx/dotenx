package crud

import (
	"fmt"
	"os"
	"testing"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

var dbConnection *db.DB

func TestMain(m *testing.M) {
	var err error
	dbConnection, err = utils.InitializeDB()
	if err != nil {
		panic(err)
	}
	// do before test actions such as initializing db
	exitVal := m.Run()
	// do after test actions such as revert db changes that was for test
	fmt.Println("all tests finished")
	os.Exit(exitVal)
}
