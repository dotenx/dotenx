package publishutils

type Event struct {
	Id      string        `json:"id"`
	Kind    string        `json:"kind"`
	Actions []EventAction `json:"actions"`
}

type EventAction struct {
	Id             string `json:"id"`
	Kind           string `json:"kind"`
	Name           string `json:"name"`
	Code           string `json:"code"`
	ValueToSet     string `json:"valueToSet"`
	DataSourceName string `json:"dataSourceName"`
	Body           string `json:"body"`
	Params         string `json:"params"`
}
