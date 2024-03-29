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
	To             struct {
		Value []TextState `json:"value"`
	} `json:"to"`
	AnimationName    string                 `json:"animationName"`
	Target           map[string]interface{} `json:"target"`
	AnimationOptions map[string]interface{}
}

type TextState struct {
	Kind  string `json:"kind"`
	Value string `json:"value"`
}

type Binding struct {
	FromStateName string `json:"fromStateName"`
	Condition     string `json:"condition"`
	Value         struct {
		Value []TextState `json:"value"`
	} `json:"value"`
	Class string `json:"class"`
}

type Bindings struct {
	Hide  Binding `json:"hide"`
	Show  Binding `json:"show"`
	Class Binding `json:"class"`
}

type Animation struct {
	Id      string                 `json:"id"`
	Name    string                 `json:"name"`
	Options map[string]interface{} `json:"options"`
}
