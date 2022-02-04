package models

type Task struct {
	Detailes TaskDetails `json:"task"`
}

type TaskDetails struct {
	Name           string                 `json:"name"`
	Id             string                 `json:"id"`
	Type           string                 `json:"type"`
	Body           map[string]interface{} `json:"body"`
	ServiceAccount string                 `json:"serviceAccount"`
}

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
}
