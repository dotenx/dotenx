package integration_tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCreateFromTemplate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/template/name/:name", crudController.CreateFromTemplate())
	body := map[string]map[string]string{
		"slackTask": {
			"target_id": "123",
		},
		"task2": {
			"image": "image123",
		},
		"trigger1": {
			"passed_seconds": "200",
		},
	}
	bodybytes, _ := json.Marshal(body)
	req, err := http.NewRequest(http.MethodPost, "/template/name/integration_test_template2", bytes.NewBuffer(bodybytes))
	if err != nil {
		t.Errorf("this is the error: %v\n", err)
	}
	req.Header.Set("accept", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	assert.Equal(t, 200, rr.Code)
	if rr.Code == 200 {
		responseMap := make(map[string]interface{})
		err = json.Unmarshal(rr.Body.Bytes(), &responseMap)
		if err != nil {
			t.Errorf("Cannot convert to json: %v", err)
		}
		fmt.Println("this is the response data: ", responseMap)
		created, err := crudController.Service.GetPipelineByName("integration_test_account_id", responseMap["name"].(string))
		assert.Nil(t, err)
		assert.Equal(t, false, created.IsTemplate)
		assert.NotNil(t, created.PipelineDetailes.Manifest.Tasks["task2"])
		assert.Equal(t, "200", created.PipelineDetailes.Manifest.Triggers["trigger1"].Credentials["passed_seconds"])
	}
}
