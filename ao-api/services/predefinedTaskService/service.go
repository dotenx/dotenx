package predifinedTaskService

import (
	"errors"
)

type PredifinedTaskService interface {
	GetTasks() ([]string, error)
	GetTaskFields(taskName string) ([]string, error)
}

type predifinedTaskService struct {
	//	store runnerstore.RunnerStore
}

func NewPredefinedTaskService() PredifinedTaskService {
	return &predifinedTaskService{}
}

func (r *predifinedTaskService) GetTasks() ([]string, error) {
	return []string{"HttpCall", "CreateAccount", "GitlabAddGroupMember", "default"}, nil
}

func (r *predifinedTaskService) GetTaskFields(taskName string) ([]string, error) {
	switch taskName {
	case "HttpCall":
		return []string{"url"}, nil
	case "CreateAccount":
		return []string{"accountId", "userId"}, nil
	case "GitlabAddGroupMember":
		return []string{"privateToken", "id", "userId", "accessLevel", "expiresAt"}, nil
	case "default":
		return []string{"image", "cmd", "timeoute"}, nil
	}
	return nil, errors.New("invalid task name")
}
