package internalService

import "github.com/sirupsen/logrus"

func (ps *internalService) HandleDomainPurchase(accountId, projectTag, domainName string) (err error) {
	awsOperationId, err := ps.ProjectService.RegisterDomain(accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	return ps.ProjectService.CreateEventBridgeScheduleForDomainRegistration(accountId, projectTag, domainName, awsOperationId)
}
