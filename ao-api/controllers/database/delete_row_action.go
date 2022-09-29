package database

import (
	"errors"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

/*
Usage:

	curl -X POST http://localhost:3004/database/query/delete/project/<project_tag>/table/<table_name>

*/

func (dc *DatabaseController) DeleteRow() gin.HandlerFunc {
	return func(c *gin.Context) {

		dto := deleteDto{
			RowId: -1, // This is used to check if the row id was provided
		}
		if err := c.ShouldBindBodyWith(&dto, binding.JSON); err != nil || (dto.RowId == -1 && len(dto.Filters.FilterSet) == 0) {
			if err == nil {
				err = errors.New("invalid body, body should contain rowId or filters")
			}
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")

		tpAccountId, _ := utils.GetThirdPartyAccountId(c)

		if err := dc.Service.DeleteRow(tpAccountId, projectTag, tableName, dto.RowId, dto.Filters); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{"message": "Row(s) deleted successfully"})

	}
}

/*
Note: if filters are provided, then rowId is ignored
*/
type deleteDto struct {
	RowId   int                          `json:"rowId,omitempty"`
	Filters databaseStore.ConditionGroup `json:"filters,omitempty"`
}
