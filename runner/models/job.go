package models

type Job struct {
	Id      string `json:"id"`
	Token   string
	Timeout int                    `json:"timeout"`
	Data    map[string]interface{} `json:"data"`
}
