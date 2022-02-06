package models

type TriggerBody interface{}

// Triggers
type ManualTriggerBody struct {
	InputSchema ObjectSchema `db:"input_schema" json:"inputSchema"`
}

type ObjectSchema struct {
	Properties map[string]ObjectSchema `db:"properties" json:"properties"`
}
