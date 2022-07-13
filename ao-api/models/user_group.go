package models

type UserGroup struct {
	Name   string            `json:"name"`
	Select map[string]string `json:"select"`
	Insert map[string]string `json:"insert"`
	Delete map[string]string `json:"delete"`
	Update map[string]string `json:"update"`
}
