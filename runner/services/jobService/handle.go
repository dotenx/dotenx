package jobService

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/executors"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func (manager *JobManager) HandleJob(job models.Job, logHelper shared.LogHelper) {
	executor := executors.NewExecutor()
	returnValue := make(map[string]interface{})
	if !job.Validate() {
		fmt.Println("invalid job body")
		resultDto := models.TaskStatus{
			ReturnValue: returnValue,
			Result:      models.StatusFailed,
			Toekn:       job.Token,
		}
		err := manager.SendResult(job.Id, resultDto)
		if err != nil {
			fmt.Printf("error in setting job result: %s\n", err.Error())
		}
		return
	}
	//fmt.Println(job)
	var meta models.TaskMetaData
	bytes, _ := json.Marshal(job.Data["task_meta_data"])
	json.Unmarshal(bytes, &meta)
	taskDetails := models.TaskDetails{
		Name:     job.Data["name"].(string),
		Type:     job.Data["type"].(string),
		Body:     job.Data["body"].(map[string]interface{}),
		Image:    job.Data["image"].(string),
		MetaData: meta,
		Timeout:  int(job.Data["timeout"].(float64)),
	}
	err := manager.SetStatus(job.Id, models.TaskStatus{
		ReturnValue: returnValue,
		Result:      "started",
		Logs:        "",
	})
	if err != nil {
		fmt.Printf("error in setting job result to started: %s\n", err.Error())
	}
	result := executor.Execute(executors.ProcessTask(&taskDetails))
	//fmt.Println(result)
	resultDto := models.TaskStatus{
		ReturnValue: result.ReturnValue, //todo: get real returned Value
		Result:      models.Status(result.Status),
		Toekn:       job.Token,
		Logs:        result.Log,
	}
	//var err error
	//var id string
	fmt.Println("job result:")
	fmt.Println(result)
	fmt.Println("################################")
	if result.Error == nil {
		resultDto.Result = models.StatusCompleted
		//id, err = manager.LogHelper.Log("log: "+result.Log, true, result.Id)
	} else {
		//id, err = manager.LogHelper.Log("error: "+result.Error.Error()+", log: "+result.Log, true, result.Id)
		resultDto.Result = models.StatusFailed
	}
	/*if err != nil {
		fmt.Printf("error in setting job log: %s\n", err.Error())
	} else {
		fmt.Println("jobId: " + id)
	}*/
	if resultDto.Result == models.StatusCompleted {
		resultFile, err := os.Open(config.Configs.App.FileSharing + "/task_" + taskDetails.Name + "_result.json")
		if err != nil {
			log.Println(err)
		}
		defer resultFile.Close()
		byteValue, _ := ioutil.ReadAll(resultFile)
		json.Unmarshal([]byte(byteValue), &returnValue)
		resultDto.ReturnValue = returnValue
	}
	err = manager.SetStatus(job.Id, resultDto)
	if err != nil {
		fmt.Printf("error in setting job result: %s\n", err.Error())
	}
	err = manager.SendResult(job.Id, resultDto)
	if err != nil {
		fmt.Printf("error in sending job result: %s\n", err.Error())
	}
}
