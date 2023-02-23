package crudService

import (
	"strconv"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (cm *crudManager) ActivatePipeline(accountId, pipelineId string) (err error) {
	id, _ := strconv.Atoi(pipelineId)
	hasAccess, err := cm.CheckAccess(accountId, id)
	if err != nil {
		return err
	}
	if !hasAccess {
		return utils.ErrReachLimitationOfPlan
	}
	pipeline, err := cm.Store.GetById(noContext, id)
	if err != nil {
		return
	}
	// the comment codes used for change trigger frequency based on user plan
	// if !pipeline.IsTemplate && !pipeline.IsInteraction {
	// 	plan, err := utils.GetUserPlan(accountId)
	// 	if err != nil {
	// 		return err
	// 	}
	// 	planTriggerFrequency := fmt.Sprint(plan["plan_trigger_frequency"])
	// 	redisKey := "ao-api-trigger-frequency-" + planTriggerFrequency
	// 	redisValue := pipeline.Endpoint
	// 	err = cm.RedisStore.AddToRedisSortedSet(redisKey, []interface{}{redisValue})
	// 	if err != nil {
	// 		return err
	// 	}
	// }
	err = cm.Store.ActivatePipeline(noContext, accountId, pipelineId)
	if err != nil {
		return
	}
	err = cm.EnableEventBridgeScheduler(pipeline.Endpoint)
	if err != nil {
		return err
	}
	err = cm.TriggerService.EnableAllScheduledTriggers(pipeline.Endpoint)
	if err != nil {
		return err
	}
	return cm.NotifyPlanmanageForActivation(accountId, "activate", pipelineId, false)
}

func (cm *crudManager) CheckAccess(accId string, excutionId int) (bool, error) {
	// NOTE: currently we ignore limitation because body of this request should change based on project type
	// dt := automationDto{AccountId: accId, AutomationId: strconv.Itoa(excutionId)}
	// json_data, err := json.Marshal(dt)
	// if err != nil {
	// 	return false, errors.New("bad input body")
	// }
	// requestBody := bytes.NewBuffer(json_data)
	// token, err := utils.GeneratToken()
	// if err != nil {
	// 	return false, err
	// }
	// Requestheaders := []utils.Header{
	// 	{
	// 		Key:   "Authorization",
	// 		Value: token,
	// 	},
	// 	{
	// 		Key:   "Content-Type",
	// 		Value: "application/json",
	// 	},
	// }
	// httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	// out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.Admin+"/internal/user/access/automation", requestBody, Requestheaders, time.Minute, true)
	// if err != nil {
	// 	return false, err
	// }
	// //fmt.Println(string(out))
	// if status != http.StatusOK && status != http.StatusAccepted {
	// 	return false, errors.New("not ok with status: " + strconv.Itoa(status))
	// }
	// var res struct {
	// 	Access bool `json:"access"`
	// }
	// if err := json.Unmarshal(out, &res); err != nil {
	// 	return false, err
	// }
	// return res.Access, nil
	return true, nil
}

func (cm *crudManager) DeActivatePipeline(accountId, pipelineId string, deleteRecord bool) (err error) {
	id, _ := strconv.Atoi(pipelineId)
	pipeline, err := cm.Store.GetById(noContext, id)
	if err != nil {
		return
	}
	// the comment codes used for change trigger frequency based on user plan
	// if !pipeline.IsTemplate && !pipeline.IsInteraction {
	// 	plan, err := utils.GetUserPlan(accountId)
	// 	if err != nil {
	// 		return err
	// 	}
	// 	planTriggerFrequency := fmt.Sprint(plan["plan_trigger_frequency"])
	// 	redisKey := "ao-api-trigger-frequency-" + planTriggerFrequency
	// 	redisValue := pipeline.Endpoint
	// 	err = cm.RedisStore.RemoveFromRedisSortedSet(redisKey, []interface{}{redisValue})
	// 	if err != nil {
	// 		return err
	// 	}
	// }
	err = cm.Store.DeActivatePipeline(noContext, accountId, pipelineId)
	if err != nil {
		return
	}
	err = cm.DisableEventBridgeScheduler(pipeline.Endpoint)
	if err != nil {
		return err
	}
	err = cm.TriggerService.DisableAllScheduledTriggers(pipeline.Endpoint)
	if err != nil {
		return err
	}
	return cm.NotifyPlanmanageForActivation(accountId, "deactivate", pipelineId, deleteRecord)
}

func (cm *crudManager) GetActivePipelines(accountId, projectName string) ([]models.Pipeline, error) {
	pipelines, err := cm.Store.GetPipelines(noContext, accountId)
	if err != nil {
		return nil, err
	}
	actives := make([]models.Pipeline, 0)
	for _, p := range pipelines {
		if p.IsActive {
			actives = append(actives, p)
		}
	}
	return actives, nil
}
