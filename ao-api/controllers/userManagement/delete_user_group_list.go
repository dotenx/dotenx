package userManagement

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (umc *UserManagementController) DeleteUserGroup() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		projectTag := ctx.Param("tag")
		ugName := ctx.Param("name")
		if ugName == "" || projectTag == "" {
			ctx.Status(http.StatusBadRequest)
			return
		}

		err := umc.Service.DeleteUserGroup(ugName, projectTag)
		if err != nil {
			log.Println(err.Error())
			ctx.Status(http.StatusInternalServerError)
			return
		}
		ctx.Status(http.StatusOK)
	}
}
