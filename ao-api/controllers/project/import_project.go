package project

import (
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/gin-gonic/gin"
)

func (pc *ProjectController) ImportProject(dbService databaseService.DatabaseService, cService crudService.CrudService) gin.HandlerFunc {
	return func(c *gin.Context) {
		//accountId, _ := utils.GetAccountId(c)
		// how to figure out the project exported detailes?
	}
}
