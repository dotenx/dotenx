package internalService

import (
	"math"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
)

func (ps *internalService) ListTpUsers(projects []models.Project, accountId string) ([]models.ThirdUser, error) {
	tpUsers := make([]models.ThirdUser, 0)
	for _, project := range projects {
		projectTag := project.Tag
		tpUsersInterface, err := ps.DatabaseStore.SelectRows(noContext, false, "", projectTag, "user_info", []string{"*"}, []databaseStore.Function{}, databaseStore.ConditionGroup{}, "", false, 0, math.MaxInt)
		if err != nil {
			return []models.ThirdUser{}, err
		}
		if tpUsersInterface["rows"] != nil {
			for _, user := range tpUsersInterface["rows"].([]map[string]interface{}) {
				tpUsers = append(tpUsers, models.ThirdUser{
					Email:     user["email"].(string),
					FullName:  user["fullname"].(string),
					AccountId: user["account_id"].(string),
				})
			}
		}
	}
	return tpUsers, nil
}
