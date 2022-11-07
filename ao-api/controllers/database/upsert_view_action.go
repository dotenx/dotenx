package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) UpsertView() gin.HandlerFunc {
	return func(c *gin.Context) {

		accountId, _ := utils.GetAccountId(c)
		var dto upsertViewDto
		if err := c.ShouldBindBodyWith(&dto, binding.JSON); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		var jsonValue map[string]interface{}
		if err := c.ShouldBindBodyWith(&jsonValue, binding.JSON); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		logrus.Info(jsonValue)
		if _, ok := jsonValue["columns"]; ok && len(jsonValue["columns"].([]interface{})) == 0 {
			dto.Columns = []string{"*"}
		}

		err := dc.Service.UpsertView(accountId, dto.ProjectName, dto.ViewName, dto.TableName, dto.Columns, dto.Filters, jsonValue, dto.IsPublic)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "view creating(updating) was successful",
		})

	}
}

type upsertViewDto struct {
	Columns     []string                     `json:"columns"`
	ProjectName string                       `json:"projectName" binding:"required"`
	TableName   string                       `json:"tableName"   binding:"required"`
	ViewName    string                       `json:"viewName"    binding:"required"`
	Filters     databaseStore.ConditionGroup `json:"filters,omitempty"`
	IsPublic    bool                         `json:"isPublic"`
}
