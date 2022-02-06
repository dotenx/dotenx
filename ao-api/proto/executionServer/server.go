package executionserver

import (
	"context"
	"log"

	"github.com/utopiops/automated-ops/ao-api/proto/pb"
	"github.com/utopiops/automated-ops/ao-api/services/executionService"
)

type ExecutionServer struct {
	pb.UnimplementedExecutionServiceServer
	service executionService.ExecutionService
}

func New(service executionService.ExecutionService) *ExecutionServer {
	return &ExecutionServer{service: service}
}

func (e *ExecutionServer) SubmitTaskResult(ctx context.Context, taskResult *pb.TaskResult) (*pb.Void, error) {
	log.Println(taskResult)
	err := e.service.GetNextTask(int(taskResult.TaskId), int(taskResult.ExecutionId), taskResult.Status, taskResult.AccountId)
	return nil, err
}

func (e *ExecutionServer) SetTaskStatus(ctx context.Context, taskStatus *pb.TaskStatus) (*pb.Void, error) {
	err := e.service.SetTaskExecutionResult(int(taskStatus.ExecutionId), int(taskStatus.TaskId), taskStatus.Status, nil)
	return nil, err
}
