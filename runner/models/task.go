package models

type Task struct {
	Detailes TaskDetails `json:"task"`
}

type TaskDetails struct {
	Name           string   `json:"name"`
	Id             string   `json:"id"`
	Type           string   `json:"type"`
	Timeout        int      `json:"timeout"`
	Body           TaskBody `json:"body"`
	ServiceAccount string   `json:"serviceAccount"`
}

type TaskBody map[string]interface{}

type TaskResult struct {
	Name      string `json:"name"`
	Id        string `json:"id"`
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
