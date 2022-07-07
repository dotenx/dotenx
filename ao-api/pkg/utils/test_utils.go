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

var testSeeds = []string{
	`INSERT INTO pipelines (name, account_id, is_active, is_template, is_interaction)
     VALUES ` + getValues(getPipelinesInsertStatement(mockPipelines)) + `;`,
}

var clearSeeds = []string{
	`DELETE FROM pipelines WHERE account_id = 'integration_test_account_id';`,
	`DELETE FROM event_triggers WHERE account_id = 'integration_test_account_id';`,
}

func Bootstrap() error {
	err := godotenv.Load("../../../.env")
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

func RefreshDb(db *dbPkg.DB) error {
	for _, seed := range clearSeeds {
		_, err := db.Connection.Exec(seed)
		if err != nil {
			return err
		}
	}
	return nil
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

var mockPipelines = map[string]models.PipelineSummery{
	"integration_test_automation1": {
		PipelineDetailes: models.PipelineVersion{
			Manifest: models.Manifest{
				Tasks:    map[string]models.Task{},
				Triggers: map[string]models.EventTrigger{},
			},
		},
		IsActive:      false,
		IsTemplate:    false,
		IsInteraction: false,
	},
	"integration_test_template1": {
		PipelineDetailes: models.PipelineVersion{
			Manifest: models.Manifest{
				Tasks:    map[string]models.Task{},
				Triggers: map[string]models.EventTrigger{},
			},
		},
		IsActive:      false,
		IsTemplate:    true,
		IsInteraction: false,
	},
	"integration_test_interaction1": {
		PipelineDetailes: models.PipelineVersion{
			Manifest: models.Manifest{
				Tasks:    map[string]models.Task{},
				Triggers: map[string]models.EventTrigger{},
			},
		},
		IsActive:      false,
		IsTemplate:    false,
		IsInteraction: true,
	},
}

func getPipelinesInsertStatement(pipelines map[string]models.PipelineSummery) []string {
	result := make([]string, 0)
	for name, pipeline := range mockPipelines {
		result = append(result, fmt.Sprintf("('%s', 'integration_test_account_id', %t, %t, %t)", name, pipeline.IsActive, pipeline.IsTemplate, pipeline.IsInteraction))
	}
	return result
}

func getPipelinesNameStatement(pipelines map[string]models.PipelineSummery) string {
	result := "("
	counter := 0
	for name, _ := range pipelines {
		result += "'" + name + "'"
		if len(pipelines)-counter > 1 {
			result += ", "
		}
		counter++
	}
	result += " )"
	return result
}
