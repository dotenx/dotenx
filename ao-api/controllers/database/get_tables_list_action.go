package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) GetTablesList(pService projectService.ProjectService) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectName := c.Param("project_name")

		tables, err := dc.Service.GetTablesList(accountId, projectName)
		if err != nil {
			logrus.Error(err.Error())
			if err == utils.ErrUserDatabaseNotFound {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			} else if err.Error() != "not found" {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "an internal server error occurred",
				})
				return
			}
		}

		// we should filter default tables
		filteredTables := make([]string, 0)
		for _, t := range tables {
			if utils.ContainsString(utils.UserDatabaseDefaultTables, t) {
				continue
			}
			filteredTables = append(filteredTables, t)
		}

		project, err := pService.GetProject(accountId, projectName)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		type table struct {
			Name          string `json:"name"`
			IsPublic      bool   `json:"is_public"`
			IsWritePublic bool   `json:"is_write_public"`
		}
		results := make([]table, 0)
		for _, t := range filteredTables {
			isPublic, _ := dc.Service.IsTablePublic(project.Tag, t)
			// some table has not comment (for determine is public or not) so we should ignore error now
			// if err != nil {
			// 	logrus.Error(err.Error())
			// 	c.AbortWithStatus(http.StatusInternalServerError)
			// 	return
			// }
			isWritePublic, _ := dc.Service.IsWriteToTablePublic(project.Tag, t)
			resTable := table{
				Name:          t,
				IsPublic:      isPublic,
				IsWritePublic: isWritePublic,
			}
			results = append(results, resTable)
		}

		c.JSON(200, gin.H{"tables": results})

	}
}
