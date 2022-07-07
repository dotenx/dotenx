package models

var IntegrationTestSamples = map[string]struct {
	InputJSONOrYaml   string
	StatusCode        int
	Name              string
	ErrMessage        string
	Istemplate        bool
	TaskName          string
	TaskField         string
	TaskFieldValue    string
	TriggerName       string
	TriggerField      string
	TriggerFieldValue string
}{
	"template_success": {
		InputJSONOrYaml:   test1,
		StatusCode:        200,
		Name:              "integration_test_template2",
		Istemplate:        true,
		TaskName:          "task1",
		TriggerName:       "trigger1",
		TriggerField:      "channel_id",
		TriggerFieldValue: "integration_test_channel_id",
	},
	"template_failed": {
		InputJSONOrYaml: test2,
		StatusCode:      400,
	},
	"automation_yaml_ok": {
		InputJSONOrYaml:   test3,
		StatusCode:        200,
		Name:              "integration_test_automation2",
		Istemplate:        false,
		TaskName:          "slackTest",
		TriggerName:       "trigger1",
		TriggerField:      "channel_id",
		TriggerFieldValue: "general3Id",
	},
	"interaction_ok": {
		InputJSONOrYaml: test4,
		StatusCode:      200,
		Name:            "integration_test_interaction2",
		Istemplate:      false,
		TaskName:        "task2",
		TaskField:       "image",
		TaskFieldValue:  "{\"source\":\"interactionRunTime\",\"key\":\"text\"}",
	},
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
                    "passed_seconds": ""
                }
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

var test4 = `{
    "name": "integration_test_interaction2",
    "is_interaction":true,
    "manifest": {
        "tasks": {
            "slackTask": {
                "type": "Send slack message",
                "body": {
                    "outputs": null,
                    "target_id": "",
                    "text": ""
                },
                "integration": "",
                "executeAfter": {}
            },
            "task2": {
                "type": "Run image",
                "body": {
                    "outputs": null,
                    "image": "",
                    "script":""
                },
                "integration": "",
                "executeAfter": {
                    "slackTask": [
                        "failed",
                        "completed"
                    ]
                }
            }
        }
    }
}`
