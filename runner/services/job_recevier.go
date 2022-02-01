package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"time"

	"gitlab.com/utopiops-water/ao-runner/grpcClient"
	"gitlab.com/utopiops-water/ao-runner/models"
)

func StartReceiving(c grpcClient.JobStreamServiceClient, clientId string, taskChan chan models.Task) {
	req := &grpcClient.JobStreamRequest{
		ClientId: clientId,
	}
	stream, err := c.GetJobs(context.Background(), req)
	if err != nil {
		log.Fatalf("error while streaming: %v", err)
		return
	}
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Error while streaming PrimeDecomposition RPC: %v", err)
			time.Sleep(10 * time.Second)
			continue
		}
		fmt.Println(res.Payload)
		var task models.Task
		json.Unmarshal([]byte(res.Payload), &task)
		fmt.Println(task)
		taskChan <- task
	}
}
