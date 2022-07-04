package project

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/dotenx/dotenx/ao-api/config"
	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

func SetUpRouter() *gin.Engine {
	router := gin.Default()
	return router
}

func TestAddProjectAction(t *testing.T) {

	err := bootstrap()
	log.Println(err)
	assert.NoError(t, err)
	registerCustomValidators()
	db, err := initializeDB()
	log.Println(err)
	assert.NoError(t, err)
	ProjectStore := projectStore.New(db)
	UserManagementStore := userManagementStore.New()
	ProjectService := projectService.NewProjectService(ProjectStore, UserManagementStore)
	projectController := ProjectController{Service: ProjectService}

	r := SetUpRouter()
	r.POST("/project", projectController.AddProject())
	testProject := models.Project{
		Name:        "unit_Test_5",
		Description: "just for unit testing",
		AccountId:   "test-account-id",
	}
	jsonValue, _ := json.Marshal(testProject)
	req, _ := http.NewRequest("POST", "/project", bytes.NewBuffer(jsonValue))

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	err = db.Connection.Close()
	assert.NoError(t, err)
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

func initializeDB() (*dbPkg.DB, error) {
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
	return db, err
}

func registerCustomValidators() {

	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("regexp", regexpValidator) // Usage: regexp=<your-regexp>
	}
}

func regexpValidator(f validator.FieldLevel) bool {
	param := f.Param()
	reg := regexp.MustCompile(param)
	return reg.MatchString(f.Field().String())
}
