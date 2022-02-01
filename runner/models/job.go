package models

type JobDto struct {
	Action      string
	ExecutionId int
	PipelineId  int
	Input       map[string]interface{}
}

type Job struct {
	ExecutionId int
	PipelineId  int // todo: delete this, it's derived
	ActionId    int // Negative ActionId indicates no action is provided, in this case we also don't (need to) provide the Status
	Status      string
}
