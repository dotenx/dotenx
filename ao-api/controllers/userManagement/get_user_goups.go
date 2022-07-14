package userManagement

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (umc *UserManagementController) GetUserGroups() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		projectTag := ctx.Param("tag")
		if projectTag == "" {
			ctx.Status(http.StatusBadRequest)
			return
		}

		groups, err := umc.Service.GetUserGroups(projectTag)
		if err != nil {
			log.Println(err.Error())
			ctx.Status(http.StatusInternalServerError)
		}
		userGroups := make(map[string]map[string][]string)
		for _, group := range groups {
			ug := make(map[string][]string)
			for _, tableName := range group.Insert {
				if ug[tableName] == nil {
					ug[tableName] = []string{}
				}
				ug[tableName] = append(ug[tableName], "insert")
			}
			for _, tableName := range group.Delete {
				if ug[tableName] == nil {
					ug[tableName] = []string{}
				}
				ug[tableName] = append(ug[tableName], "delete")
			}
			for _, tableName := range group.Update {
				if ug[tableName] == nil {
					ug[tableName] = []string{}
				}
				ug[tableName] = append(ug[tableName], "update")
			}
			for _, tableName := range group.Select {
				if ug[tableName] == nil {
					ug[tableName] = []string{}
				}
				ug[tableName] = append(ug[tableName], "select")
			}
			userGroups[group.Name] = ug
		}
		ctx.JSON(http.StatusOK, userGroups)
	}
}
