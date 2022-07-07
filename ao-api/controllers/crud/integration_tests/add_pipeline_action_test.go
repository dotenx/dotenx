package integration_tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
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
			if rr.Code == 200 || (rr.Code == 400 && pipeName == "template_success") || rr.Code == 500 {
				responseMap := make(map[string]interface{})
				err = json.Unmarshal(rr.Body.Bytes(), &responseMap)
				if err != nil {
					t.Errorf("Cannot convert to json: %v", err)
				}
				fmt.Println("this is the response data: ", responseMap)
				assert.Equal(t, samp.Name, responseMap["name"])
				created, err := crudController.Service.GetPipelineByName("integration_test_account_id", samp.Name)
				assert.Nil(t, err)
				assert.Equal(t, samp.Istemplate, created.IsTemplate)
				assert.NotNil(t, created.PipelineDetailes.Manifest.Tasks[samp.TaskName])

				if pipeName == "interaction_ok" {
					body := fmt.Sprintf("%v", created.PipelineDetailes.Manifest.Tasks[samp.TaskName].Body)
					if !strings.Contains(body, "interactionRunTime") {
						t.Errorf("expected %v, got %v", samp.TaskFieldValue, body)
					}
				} else {
					assert.Equal(t, samp.TriggerFieldValue, created.PipelineDetailes.Manifest.Triggers[samp.TriggerName].Credentials[samp.TriggerField])
				}
			}
		})
	}
}
