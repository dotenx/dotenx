package models

type Job struct {
	Id   string                 `json:"id"`
	Data map[string]interface{} `json:"data"`
}
