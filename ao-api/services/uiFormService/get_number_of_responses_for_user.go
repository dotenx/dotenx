package uiFormService

func (uf *uiFormService) GetNumberOfResponsesForUser(accountId, projectType, from, to string) (int64, error) {
	return uf.Store.GetNumberOfResponsesForUser(noContext, accountId, projectType, from, to)
}
