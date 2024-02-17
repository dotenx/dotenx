package models

import "encoding/json"

type Project struct {
	Id                     int             `db:"id" json:"-"`
	Name                   string          `db:"name" json:"name" binding:"regexp=^[a-z][a-z0-9_]*$,min=2,max=20"`
	Description            string          `db:"description" json:"description"`
	AccountId              string          `db:"account_id" json:"-"`
	Tag                    string          `db:"tag" json:"tag"`
	DefaultUserGroup       string          `json:"default_user_group"`
	Type                   string          `db:"type" json:"type"`
	AIWebsiteConfiguration json.RawMessage `db:"ai_website_configuration" json:"ai_website_configuration"`
	Theme                  string          `db:"theme" json:"theme"`
	HasDatabase            bool            `db:"has_database" json:"hasDatabase"`
}

type AIWebsiteConfigurationType struct {
	BusinessName    string          `json:"business_name"`
	BusinessType    string          `json:"business_type"`
	BusinessSubType string          `json:"business_sub_type"`
	ContactInfo     ContactInfoType `json:"contact_info" binding:"dive"`
	LogoUrl         string          `json:"logo_url"`
	Description     string          `json:"description"`
}

type ContactInfoType struct {
	Email         string `json:"email"`
	PhoneNumber   string `json:"phone_number"`
	Country       string `json:"country" binding:"oneof='AU'"`
	State         string `json:"state" binding:"oneof='ACT' 'NSW' 'NT' 'QLD' 'SA' 'TAS' 'VIC' 'WA'"`
	City          string `json:"city"`
	Address1      string `json:"address1"`
	Address2      string `json:"address2"`
	Postcode      string `json:"postcode"`
	FacebookLink  string `json:"facebook_link"`
	InstagramLink string `json:"instagram_link"`
	LinkedInLink  string `json:"linkedin_link"`
	XLink         string `json:"x_link"`
}

// TODO: Add UI Pages
type ProjectDto struct {
	Name           string               `json:"name"`
	AccountId      string               `json:"account_id"`
	Pipelines      []PipelineProjectDto `json:"pipelines"`
	DataBaseTables []DatabaseTable      `json:"database_tables"`
	UIPages        []ExportableUIPage   `json:"ui_pages"`
}

type PipelineProjectDto struct {
	Dto           PipelineDto `json:"dto"`
	IsPublic      bool        `json:"is_public"`
	IsInteraction bool        `json:"is_interaction"`
	IsTemplate    bool        `json:"is_template"`
	UserGroups    []string    `json:"user_groups"`
}

type DatabaseTable struct {
	Name          string     `json:"name"`
	IsPublic      bool       `json:"is_public"`
	IsWritePublic bool       `json:"is_write_public"`
	Columns       []PgColumn `json:"columns"`
}

type PgColumn struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type ExportableUIPage struct {
	Name    string          `db:"name" json:"name"`
	Content json.RawMessage `db:"content" json:"content"`
}

type ExportableUIComponent struct {
	Name     string          `db:"name" json:"name"`
	Content  json.RawMessage `db:"content" json:"content"`
	Category string          `db:"category" json:"category"`
}

type ExportableUIExtension struct {
	Name     string          `db:"name" json:"name"`
	Content  json.RawMessage `db:"content" json:"content"`
	Category string          `db:"category" json:"category"`
}
