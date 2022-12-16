package models

type SecurityCode struct {
	Email          string `json:"email"          db:"email"`
	SecurityCode   string `json:"securityCode"   db:"security_code"`
	ExpirationTime int    `json:"expirationTime" db:"expiration_time"`
	Usable         bool   `json:"usable"         db:"usable"`
	UseCase        string `json:"useCase"        db:"use_case"`
}
