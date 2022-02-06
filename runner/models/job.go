package models

type Job struct {
	Id    string `json:"id"`
	Token string
	Data  map[string]interface{} `json:"data"`
}
