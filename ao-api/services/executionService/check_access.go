package executionService

// TODO: automation_id isn't important for plan manager and should be deleted from CheckAccess function
func (manager *executionManager) CheckAccess(accountId string, excutionId int) (bool, error) {
	// NOTE: currently we ignore limitation because body of this request should change based on project type
	// dt := automationDto{AccountId: accountId, AutomationId: strconv.Itoa(excutionId)}
	// json_data, err := json.Marshal(dt)
	// if err != nil {
	// 	return false, errors.New("bad input body")
	// }
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
	// out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.Admin+"/internal/user/access/executionMinutes", bytes.NewBuffer(json_data), Requestheaders, time.Minute, true)
	// if err != nil {
	// 	return false, err
	// }
	// //fmt.Println(string(out))
	// if status != http.StatusOK && status != http.StatusAccepted {
	// 	logrus.Println(string(out))
	// 	return false, errors.New("not ok with status: " + strconv.Itoa(status))
	// }
	// var res struct {
	// 	Access bool `json:"access"`
	// }
	// if err := json.Unmarshal(out, &res); err != nil {
	// 	return false, err
	// }
	// if !res.Access {
	// 	return false, nil
	// }

	// out, err, status, _ = httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.Admin+"/internal/user/access/executionTasks", bytes.NewBuffer(json_data), Requestheaders, time.Minute, true)
	// if err != nil {
	// 	return false, err
	// }
	// if status != http.StatusOK && status != http.StatusAccepted {
	// 	logrus.Println(string(out))
	// 	return false, errors.New("not ok with status: " + strconv.Itoa(status))
	// }
	// if err := json.Unmarshal(out, &res); err != nil {
	// 	return false, err
	// }

	// return res.Access, nil
	return true, nil
}

type automationDto struct {
	AccountId    string `json:"account_id" binding:"required"`
	AutomationId string `json:"automation_id" binding:"required"`
}
