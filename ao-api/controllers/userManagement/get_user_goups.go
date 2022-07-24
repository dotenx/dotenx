package userManagement

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
)

func (umc *UserManagementController) GetUserGroups() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		projectTag := ctx.Param("tag")
		if projectTag == "" {
			ctx.Status(http.StatusBadRequest)
			return
		}
		user_group_name := ctx.Query("name")
		groups := make([]*models.UserGroup, 0)
		var err error
		if user_group_name != "" {
			group, err := umc.Service.GetUserGroupByName(user_group_name, projectTag)
		} else {
			groups, err = umc.Service.GetUserGroups(projectTag)
		}
		if err != nil {
			log.Println(err.Error())
			ctx.Status(http.StatusInternalServerError)
		}
		userGroups := make(map[string]userGroup)
		for _, group := range groups {
			ug := userGroup{
				Name:        group.Name,
				Description: group.Description,
				IsDefault:   group.IsDefault,
				Privilages:  make(map[string][]string),
			}
			for _, tableName := range group.Insert {
				if ug.Privilages[tableName] == nil {
					ug.Privilages[tableName] = []string{}
				}
				ug.Privilages[tableName] = append(ug.Privilages[tableName], "insert")
			}
			for _, tableName := range group.Delete {
				if ug.Privilages[tableName] == nil {
					ug.Privilages[tableName] = []string{}
				}
				ug.Privilages[tableName] = append(ug.Privilages[tableName], "delete")
			}
			for _, tableName := range group.Update {
				if ug.Privilages[tableName] == nil {
					ug.Privilages[tableName] = []string{}
				}
				ug.Privilages[tableName] = append(ug.Privilages[tableName], "update")
			}
			for _, tableName := range group.Select {
				if ug.Privilages[tableName] == nil {
					ug.Privilages[tableName] = []string{}
				}
				ug.Privilages[tableName] = append(ug.Privilages[tableName], "select")
			}
			userGroups[group.Name] = ug
		}
		ctx.JSON(http.StatusOK, userGroups)
	}
}

type userGroup struct {
	Name        string              `json:"name"`
	Description string              `json:"description"`
	IsDefault   bool                `json:"is_default"`
	Privilages  map[string][]string `json:"privilages"`
}
