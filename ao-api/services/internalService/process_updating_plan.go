package internalService

func (ps *internalService) ProcessUpdatingPlan(accountId string) (err error) {
	// the comment codes used for change trigger frequency based on user plan

	// // First we should remove all active pipeline endpoints from all trigger frequeny lists
	// pipelines, err := ps.PipelineService.GetPipelines(accountId)
	// if err != nil {
	// 	return err
	// }
	// activePipelineEndpoints := make([]interface{}, 0)
	// for _, pipeline := range pipelines {
	// 	if pipeline.IsActive {
	// 		activePipelineEndpoints = append(activePipelineEndpoints, pipeline.Endpoint)
	// 	}
	// }
	// frequencyListStr := strings.Split(config.Configs.TaskAndTrigger.FrequencyList, ",")
	// for _, freq := range frequencyListStr {
	// 	key := "ao-api-trigger-frequency-" + freq
	// 	err = ps.RedisStore.RemoveFromRedisSortedSet(key, activePipelineEndpoints)
	// 	if err != nil {
	// 		return err
	// 	}
	// }

	// // Then add active pipeline endpoints to trigger frequeny list that is related to his/her new plan
	// plan, err := utils.GetUserPlan(accountId)
	// if err != nil {
	// 	return err
	// }
	// planTriggerFrequency := fmt.Sprint(plan["plan_trigger_frequency"])
	// redisKey := "ao-api-trigger-frequency-" + planTriggerFrequency
	// err = ps.RedisStore.AddToRedisSortedSet(redisKey, activePipelineEndpoints)
	// return
	return nil
}
