package crud

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

var integrationTestSamples = map[string]struct {
	inputJSONOrYaml   string
	statusCode        int
	name              string
	errMessage        string
	Istemplate        bool
	TaskName          string
	TriggerName       string
	TriggerField      string
	TriggerFieldValue string
}{
	"template_success": {
		inputJSONOrYaml:   test1,
		statusCode:        200,
		name:              "integration_test_template2",
		Istemplate:        true,
		TaskName:          "task1",
		TriggerName:       "trigger1",
		TriggerField:      "channel_id",
		TriggerFieldValue: "integration_test_channel_id",
	},
	"template_failed": {
		inputJSONOrYaml: test2,
		statusCode:      400,
	},
	"automation_yaml_ok": {
		inputJSONOrYaml:   test3,
		statusCode:        200,
		name:              "integration_test_automation2",
		Istemplate:        false,
		TaskName:          "slackTest",
		TriggerName:       "trigger1",
		TriggerField:      "channel_id",
		TriggerFieldValue: "general3Id",
	},
}

func TestAddPipeline(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/pipeline", crudController.AddPipeline())
	for pipeName, samp := range integrationTestSamples {
		t.Run("testing "+pipeName, func(t *testing.T) {
			req, err := http.NewRequest(http.MethodPost, "/pipeline", bytes.NewBufferString(samp.inputJSONOrYaml))
			if err != nil {
				t.Errorf("this is the error: %v\n", err)
			}
			if pipeName == "automation_yaml_ok" {
				req.Header.Set("accept", "application/x-yaml")
			}
			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req)
			assert.Equal(t, samp.statusCode, rr.Code)
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
				assert.Equal(t, samp.name, responseMap["name"])
				created, err := crudController.Service.GetPipelineByName("integration_test_account_id", samp.name)
				assert.Nil(t, err)
				assert.Equal(t, created.IsTemplate, samp.Istemplate)
				assert.NotNil(t, created.PipelineDetailes.Manifest.Tasks[samp.TaskName])
				assert.Equal(t, created.PipelineDetailes.Manifest.Triggers[samp.TriggerName].Credentials[samp.TriggerField], samp.TriggerFieldValue)
			}
		})
	}
}

var test1 = `{
    "name": "integration_test_template2",
    "is_template":true,
    "manifest": {
        "tasks": {
            "slackTask": {
                "type": "Send slack message",
                "body": {
                    "outputs": null,
                    "target_id": "",
                    "text": {
                        "source": "trigger1",
                        "key": "text"
                    }
                },
                "integration": "",
                "executeAfter": {}
            },
            "task2": {
                "type": "Run image",
                "body": {
                    "outputs": null,
                    "image": "",
                    "script": {
                        "source": "trigger1",
                        "key": "text"
                    }
                },
                "integration": "",
                "executeAfter": {
                    "slackTask": [
                        "failed",
                        "completed"
                    ]
                }
            }
        },
        "triggers": {
            "trigger1": {
                "name": "trigger1",
                "account_id": "",
                "type": "Slack new message",
                "endpoint": "e4946a65-50d3-46af-ae09-69f37d977e69",
                "pipeline_name": "template1_e8abcef4-199b-439b-9381-42b0d4ef4f76",
                "integration": "",
                "credentials": {
                    "channel_id": "integration_test_channel_id",
                    "passed_seconds": "300"
                },
                "iconUrl": "https://cdn-icons-png.flaticon.com/512/2111/2111615.png"
            }
        }
    }
}`

var test2 = `
{
    "name": "integration_test_template1",
    "is_template":true,
    "manifest": {
        "tasks": {},
        "triggers": {}
    }
}
`

var test3 = `
name: integration_test_automation2
manifest:
  tasks:
    slackTask:
      type: Send slack message
      body:
        outputs: null
        target_id: armin 3 id
        text:
          key: text
          source: trigger1
      description: description
      integration: slackBot
    task2:
      executeAfter:
        slackTask:
        - failed
        - completed
      type: Run image
      body:
        image: alpine3
        outputs: null
        script:
          key: text
          source: trigger1
      description: description
      integration: ""
  triggers:
    trigger1:
      name: trigger1
      accountid: "123456"
      type: Slack new message
      pipeline: template2_96342d78-bd90-44e7-8fad-d4a9894f2e3f
      integration: slackBot
      credentials:
        channel_id: general3Id
        passed_seconds: "300"
is_active: false
is_template: false
is_interaction: false
`
