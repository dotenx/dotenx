package project

// todo: uncomment codes when fix problem of testing services

// import (
// 	"bytes"
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"net/http/httptest"
// 	"testing"

// 	"github.com/dotenx/dotenx/ao-api/models"
// 	"github.com/dotenx/dotenx/ao-api/pkg/utils"
// 	"github.com/dotenx/dotenx/ao-api/services/projectService"
// 	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
// 	"github.com/stretchr/testify/assert"
// )

// func TestAddProjectAction(t *testing.T) {

// 	err := utils.Bootstrap()
// 	log.Println(err)
// 	assert.NoError(t, err)
// 	utils.RegisterCustomValidators()
// 	db, err := utils.InitializeDB()
// 	log.Println(err)
// 	assert.NoError(t, err)
// 	ProjectStore := projectStore.New(db)
// 	UserManagementStore := userManagementStore.New()
// 	ProjectService := projectService.NewProjectService(ProjectStore, UserManagementStore)
// 	projectController := ProjectController{Service: ProjectService}

// 	r := utils.SetUpRouter()
// 	r.POST("/project", projectController.AddProject())
// 	testProject := models.Project{
// 		Name:        "unit_Test_5",
// 		Description: "just for unit testing",
// 		AccountId:   "test-account-id",
// 	}
// 	jsonValue, _ := json.Marshal(testProject)
// 	req, _ := http.NewRequest("POST", "/project", bytes.NewBuffer(jsonValue))

// 	w := httptest.NewRecorder()
// 	r.ServeHTTP(w, req)
// 	assert.Equal(t, http.StatusOK, w.Code)

// 	err = db.Connection.Close()
// 	assert.NoError(t, err)
// }
