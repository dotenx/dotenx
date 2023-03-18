package internalService

func (ps *internalService) GetNumberOfUiFormResponse(accountId, projectType, from, to string) (int64, error) {
	return ps.UIFormService.GetNumberOfResponsesForUser(accountId, projectType, from, to)
}
