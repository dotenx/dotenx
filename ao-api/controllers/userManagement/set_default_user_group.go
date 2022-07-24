package userManagement

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type setDefaultReq struct {
	Name string `json:"name"`
}

func (umc *UserManagementController) SetDefaultUserGroup() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body setDefaultReq
		projectTag := ctx.Param("tag")
		if ctx.ShouldBindJSON(&body) != nil || body.Name == "" || projectTag == "" {
			log.Println("body:", body)
			log.Println("projectTag:", projectTag)
			ctx.Status(http.StatusBadRequest)
			return
		}

		err := umc.Service.SetDefaultUserGroup(body.Name, projectTag)
		if err != nil {
			log.Println(err.Error())
			ctx.Status(http.StatusInternalServerError)
			return
		}
		ctx.Status(http.StatusOK)
	}
}
