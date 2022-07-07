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
}

func TestAddPipeline(t *testing.T) {
	t.Run("test adding pipeline", func(t *testing.T) {
		gin.SetMode(gin.TestMode)
		for _, v := range samples {
			r := gin.Default()
			r.POST("/pipeline", crudController.AddPipeline())
			req, err := http.NewRequest(http.MethodPost, "/pipeline", bytes.NewBufferString(v.inputJSONOrYaml))
			if err != nil {
				t.Errorf("this is the error: %v\n", err)
			}
			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req)

			assert.Equal(t, v.statusCode, rr.Code)
			if rr.Code == 200 {
				responseMap := make(map[string]interface{})
				err = json.Unmarshal(rr.Body.Bytes(), &responseMap)
				if err != nil {
					t.Errorf("Cannot convert to json: %v", err)
				}
				fmt.Println("this is the response data: ", responseMap)
				//casting the interface to map:
				assert.Equal(t, v.name, responseMap["name"])
			}
			/*if v.statusCode == 400 || v.statusCode == 422 || v.statusCode == 500 && v.errMessage != "" {
				assert.Equal(t, responseMap["message"], v.errMessage)
			}*/
		}
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
                    "channel_id": "",
                    "passed_seconds": ""
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
