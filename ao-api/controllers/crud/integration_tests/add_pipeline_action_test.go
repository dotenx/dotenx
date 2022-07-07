package integration_tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAddPipeline(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/pipeline", crudController.AddPipeline())
	for pipeName, samp := range models.IntegrationTestSamples {
		t.Run("testing "+pipeName, func(t *testing.T) {
			req, err := http.NewRequest(http.MethodPost, "/pipeline", bytes.NewBufferString(samp.InputJSONOrYaml))
			if err != nil {
				t.Errorf("this is the error: %v\n", err)
			}
			if pipeName == "automation_yaml_ok" {
				req.Header.Set("accept", "application/x-yaml")
			}
			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req)
			assert.Equal(t, samp.StatusCode, rr.Code)
			if err != nil {
				t.Errorf("this is the error: %v\n", err)
			}
			if rr.Code == 200 {
				responseMap := make(map[string]interface{})
				err = json.Unmarshal(rr.Body.Bytes(), &responseMap)
				if err != nil {
					t.Errorf("Cannot convert to json: %v", err)
				}
				fmt.Println("this is the response data: ", responseMap)
				assert.Equal(t, samp.Name, responseMap["name"])
				created, err := crudController.Service.GetPipelineByName("integration_test_account_id", samp.Name)
				assert.Nil(t, err)
				assert.Equal(t, created.IsTemplate, samp.Istemplate)
				assert.NotNil(t, created.PipelineDetailes.Manifest.Tasks[samp.TaskName])
				assert.Equal(t, created.PipelineDetailes.Manifest.Triggers[samp.TriggerName].Credentials[samp.TriggerField], samp.TriggerFieldValue)
			}
		})
	}
}
