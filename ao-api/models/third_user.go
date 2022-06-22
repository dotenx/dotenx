package models

type ThirdUser struct {
	Email     string `json:"email" db:"email"`
	Password  string `json:"password" db:"password"`
	FullName  string `json:"fullname,omitempty" db:"fullname"`
	AccountId string `json:"accountId" db:"account_id"`
	CreatedAt string `json:"createdAt" db:"created_at"`
}
