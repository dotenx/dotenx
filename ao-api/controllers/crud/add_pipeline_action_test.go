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

var samples = map[string]struct {
	inputJSONOrYaml string
	statusCode      int
	name            string
	errMessage      string
}{
	"template_success": {
		inputJSONOrYaml: test1,
		statusCode:      200,
		name:            "integration_test_template2",
	},
	"template_failed": {
		inputJSONOrYaml: test2,
		statusCode:      400,
	},
	"automation_yaml_ok": {
		inputJSONOrYaml: test3,
		statusCode:      200,
		name:            "integration_test_automation2",
	},
}

func TestAddPipeline(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/pipeline", crudController.AddPipeline())
	t.Run("test adding pipeline that is already there", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodPost, "/pipeline", bytes.NewBufferString(samples["template_failed"].inputJSONOrYaml))
		if err != nil {
			t.Errorf("this is the error: %v\n", err)
		}
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		assert.Equal(t, 400, rr.Code)
	})
	t.Run("test adding pipeline successfuly", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodPost, "/pipeline", bytes.NewBufferString(samples["template_success"].inputJSONOrYaml))
		if err != nil {
			t.Errorf("this is the error: %v\n", err)
		}
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		assert.Equal(t, samples["template_success"].statusCode, rr.Code)
		if err != nil {
			t.Errorf("this is the error: %v\n", err)
		}
		responseMap := make(map[string]interface{})
		err = json.Unmarshal(rr.Body.Bytes(), &responseMap)
		if err != nil {
			t.Errorf("Cannot convert to json: %v", err)
		}
		fmt.Println("this is the response data: ", responseMap)
		//casting the interface to map:
		assert.Equal(t, samples["template_success"].name, responseMap["name"])

		created, err := crudController.Service.GetPipelineByName("integration_test_account_id", samples["template_success"].name)
		assert.Nil(t, err)
		assert.Equal(t, created.IsTemplate, true)
		assert.NotNil(t, created.PipelineDetailes.Manifest.Tasks["task1"])
		assert.Equal(t, created.PipelineDetailes.Manifest.Triggers["trigger1"].Credentials["channel_id"], "integration_test_channel_id")
	})
	t.Run("test adding automation with yaml body", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodPost, "/pipeline", bytes.NewBufferString(samples["automation_yaml_ok"].inputJSONOrYaml))
		if err != nil {
			t.Errorf("this is the error: %v\n", err)
		}
		req.Header.Set("accept", "application/x-yaml")
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		assert.Equal(t, samples["automation_yaml_ok"].statusCode, rr.Code)
		if err != nil {
			t.Errorf("this is the error: %v\n", err)
		}
		responseMap := make(map[string]interface{})
		err = json.Unmarshal(rr.Body.Bytes(), &responseMap)
		if err != nil {
			t.Errorf("Cannot convert to json: %v", err)
		}
		fmt.Println("this is the response data: ", responseMap)
		//casting the interface to map:
		assert.Equal(t, samples["automation_yaml_ok"].name, responseMap["name"])

		created, err := crudController.Service.GetPipelineByName("integration_test_account_id", samples["automation_yaml_ok"].name)
		assert.Nil(t, err)
		assert.Equal(t, created.IsTemplate, false)
		assert.NotNil(t, created.PipelineDetailes.Manifest.Tasks["slackTask"])
		assert.Equal(t, created.PipelineDetailes.Manifest.Triggers["trigger1"].Credentials["channel_id"], "general3Id")
	})

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
