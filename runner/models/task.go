package models

type TaskDetails struct {
	Name           string       `json:"name"`
	Id             int          `json:"id"`
	Type           string       `json:"type"`
	Image          string       `json:"image"`
	Timeout        int          `json:"timeout"`
	Body           TaskBody     `json:"body"`
	MetaData       TaskMetaData `json:"task_meta_data"`
	ResultEndpoint string
	Workspace      string
}

type TaskBody map[string]interface{}

type TaskExecutionResult struct {
	Name        string                 `json:"name"`
	Id          int                    `json:"id"`
	Type        string                 `json:"type"`
	AccountId   string                 `json:"accountId"`
	Log         string                 `json:"log"`
	Error       error                  `json:"error"`
	Status      string                 `json:"status"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

type TaskStatus struct {
	ReturnValue map[string]interface{} `json:"return_value"`
	Toekn       string                 `json:"token"`
	Result      Status                 `json:"result"`
	Logs        string                 `json:"logs"`
}

type Task struct {
	Details              TaskDetails
	EnvironmentVariables []string
	Script               []string
	IsPredifined         bool
}

type TaskMetaData struct {
	Type   string
	Fields []TaskField
	Image  string
}

type TaskField struct {
	Key  string `json:"key"`
	Type string `json:"type"`
}
