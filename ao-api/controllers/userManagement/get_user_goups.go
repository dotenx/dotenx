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
		ctx.JSON(http.StatusOK, groups)
	}
}
