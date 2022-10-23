package publishutils

type Event struct {
	Id      string        `json:"id"`
	Kind    string        `json:"kind"`
	Actions []EventAction `json:"actions"`
}

type ValueSource struct {
	IsState bool   `json:"isState"`
	Value   string `json:"value"`
	Mode    string `json:"mode"`
}

type EventAction struct {
	Id             string      `json:"id"`
	Kind           string      `json:"kind"`
	StateName      ValueSource `json:"stateName"`
	Code           string      `json:"code"`
	Key            ValueSource `json:"key"`
	Value          ValueSource `json:"value"`
	ValueToSet     string      `json:"valueToSet"`
	DataSourceName string      `json:"dataSourceName"`
	Body           string      `json:"body"`
	Params         string      `json:"params"`
	AnimationName  string      `json:"animationName"`
}
