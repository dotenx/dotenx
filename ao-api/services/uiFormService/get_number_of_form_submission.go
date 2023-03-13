package uiFormService

func (uf *uiFormService) GetNumberOfFormSubmission(projectTag, pageName string) (int64, error) {
	return uf.Store.GetNumberOfFormSubmission(noContext, projectTag, pageName)
}
