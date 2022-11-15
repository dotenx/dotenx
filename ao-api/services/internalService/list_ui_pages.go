package internalService

func (ps *internalService) ListUiPages(accountId string) ([]string, error) {
	return ps.UIbuilderService.ListAllPagesOfUser(accountId)
}
