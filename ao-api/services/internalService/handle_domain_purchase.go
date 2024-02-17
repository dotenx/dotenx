package internalService

import (
	"github.com/sirupsen/logrus"
)

func (ps *internalService) HandleDomainPurchase(accountId, projectTag, domainName string) (err error) {
	awsOperationId, err := ps.ProjectService.RegisterDomain(accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	err = ps.ProjectService.CreateEventBridgeScheduleForDomainRegistration(accountId, projectTag, domainName, awsOperationId)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	// update the status of domain registration
	domainDetails, err := ps.ProjectService.GetProjectDomain(accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	domainDetails.RegistrationStatus = "SUBMITTED"
	err = ps.ProjectService.UpsertProjectDomain(domainDetails)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	return
}
