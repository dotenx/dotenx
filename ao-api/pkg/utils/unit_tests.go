package utils

import (
	"fmt"
	"io/ioutil"
	"log"
	"regexp"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/config"
	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	"gopkg.in/yaml.v2"
)

func getValues(objects []string) (result string) {
	for i, str := range objects {
		result += str
		if len(objects)-i > 1 {
			result += ", "
		}
	}
	return
}

var mockPipelines = []string{
	"('automation1', 'test_account_id', true, false, false)",
	"('template1', 'test_account_id', false, true, false)",
	"('interaction1', 'test_account_id', false, false, true)",
}

var testSeeds = []string{
	`INSERT INTO pipelines (name, account_id, is_active, is_template, is_interaction)
     VALUES ` + getValues(mockPipelines) + `;`,
}

func Bootstrap() error {
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

func SetUpRouter() *gin.Engine {
	router := gin.Default()
	return router
}

// TODO change dbname and do it on a test db and then truncate all tables
// OR
// TODO do it on the main db but delete all inserted records after all to keep main db unchanged

func InitializeDB() (*dbPkg.DB, error) {
	host := "localhost"
	port := 5432
	user := "psql_user"
	password := "psql_password"
	dbName := "ao"
	extras := "sslmode=disable"
	driver := "postgres"

	connStr := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s %s",
		host, port, user, password, dbName, extras)
	log.Println(connStr)
	db, err := dbPkg.Connect(driver, connStr)
	if err != nil {
		return nil, err
	}
	for _, seed := range testSeeds {
		db.Connection.Exec(seed)
	}
	return db, err
}

func InitializeMockDB() (*dbPkg.DB, sqlmock.Sqlmock, error) {
	db, mock, err := sqlmock.New()
	if err != nil {
		return nil, nil, err
	}
	return &dbPkg.DB{
		Connection: sqlx.NewDb(db, "postgres"),
		Driver:     dbPkg.Postgres,
	}, mock, nil
}

func InitializeIntegrationConsts(address string) {
	models.AvaliableIntegrations = make(map[string]models.IntegrationDefinition)
	files, err := ioutil.ReadDir(address)
	if err != nil {
		panic(err)
	}
	for _, file := range files {
		var yamlFile models.IntegrationDefinition
		yamlData, err := ioutil.ReadFile(address + "/" + file.Name())
		if err != nil {
			panic(err)
		}
		err = yaml.Unmarshal(yamlData, &yamlFile)
		if err != nil {
			panic(err)
		}
		models.AvaliableIntegrations[yamlFile.Type] = yamlFile
	}
	fmt.Println("models.AvaliableIntegrations:", models.AvaliableIntegrations)
}

func RegisterCustomValidators() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("regexp", regexpValidator) // Usage: regexp=<your-regexp>
	}
}

func regexpValidator(f validator.FieldLevel) bool {
	param := f.Param()
	reg := regexp.MustCompile(param)
	return reg.MatchString(f.Field().String())
}
