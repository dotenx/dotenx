package userManagement

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
)

func (umc *UserManagementController) CreateUserGroup() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body models.UserGroup
		projectTag := ctx.Param("tag")
		if ctx.ShouldBindJSON(&body) != nil || body.Name == "" || projectTag == "" {
			ctx.Status(http.StatusBadRequest)
			return
		}

		err := umc.Service.CreateUserGroup(body, projectTag)
		if err != nil {
			log.Println(err.Error())
			ctx.Status(http.StatusInternalServerError)
			return
		}
		ctx.Status(http.StatusOK)
	}
}
