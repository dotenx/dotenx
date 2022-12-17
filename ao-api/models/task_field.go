package models

import "github.com/dotenx/dotenx/ao-api/pkg/formatter"

type TaskFieldDetailes struct {
	Formatter *formatter.Formatter `json:"formatter"`
	Type      string               `json:"type"`
	Source    string               `json:"source"`
	Key       string               `json:"key"`
	NestedKey string               `json:"nestedKey"`
	Value     interface{}          `json:"value"`
}

const (
	DirectValueFieldType = "directValue" // puth the value directly in the field
	RefrencedFieldType   = "refrenced"   // get value from refrenced source
	NestedFieldType      = "nested"      // call function to get value from source with nested key (recursive approach)
	FormattedFieldType   = "formatted"   // first get arguments wich can be nested, refrenced or direct value, then format the values
	JsonFieldType        = "json"        // value is json and each value of the json is a field
	JsonArrayFieldType   = "json_array"  // value is json array and each value of the json could be array
)

const (
	ForeachSourceType            = "foreach"
	GetAllSourceType             = "getAll"
	SpecificIndexSourceType      = "specificIndex"
	FullObjectSourceType         = "fullObject"
	SpeceficFullObjectSourceType = "specificFullObject"
)
