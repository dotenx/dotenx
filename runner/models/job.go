package models

type Job struct {
	Id      string `json:"id"`
	Token   string
	Timeout int                    `json:"timeout"`
	Data    map[string]interface{} `json:"data"`
}

func (j Job) Validate() bool {
	if _, ok := j.Data["name"]; !ok {
		return false
	}
	if _, ok := j.Data["type"]; !ok {
		return false
	}
	if _, ok := j.Data["body"]; !ok {
		return false
	}
	if _, ok := j.Data["timeout"]; !ok {
		return false
	}
	return true
}
