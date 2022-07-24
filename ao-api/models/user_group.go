package models

type UserGroup struct {
	Name        string            `json:"name"`
	Description string            `json:"description"`
	IsDefault   bool              `json:"is_default"`
	Select      map[string]string `json:"select"`
	Insert      map[string]string `json:"insert"`
	Delete      map[string]string `json:"delete"`
	Update      map[string]string `json:"update"`
}
