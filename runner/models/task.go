package models

type TaskDetails struct {
	Name           string       `json:"name"`
	Id             int          `json:"id"`
	Type           string       `json:"type"`
	Image          string       `json:"image"`
	Timeout        int          `json:"timeout"`
	Body           TaskBody     `json:"body"`
	ServiceAccount string       `json:"serviceAccount"`
	MetaData       TaskMetaData `json:"task_meta_data"`
}

type TaskBody map[string]interface{}

type TaskResult struct {
	Name      string `json:"name"`
	Id        int    `json:"id"`
	Type      string `json:"type"`
	AccountId string `json:"accountId"`
	Log       string `json:"log"`
	Error     error  `json:"error"`
	Status    string `json:"status"`
}
type TaskStatus struct {
	ReturnValue interface{} `json:"returnValue"`
	Toekn       string      `json:"token"`
	Result      Status      `json:"result"`
	Logs        string      `json:"logs"`
}

type Task struct {
	Detailes             TaskDetails
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
