package ecommerce

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) GetTpUserProduct() gin.HandlerFunc {
	return func(c *gin.Context) {

		accountId, _ := utils.GetAccountId(c)
		projectTag := c.Param("project_tag")
		productId := c.Param("product_id")
		productVersion := c.Param("product_version")

		project, err := ec.ProjectService.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if project.Type != "ecommerce" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "this project isn't an 'ecommerce' project",
			})
			return
		}

		tpAccountId, _ := utils.GetThirdPartyAccountId(c)
		user, err := ec.UserManagementService.GetUserInfoById(tpAccountId, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		listProductsQuery := fmt.Sprintf(`
		select __products as id, version from user_products 
		where email='%s' and valid_until > '%s';`, user.Email, time.Now().Format(time.RFC3339))

		listProductsRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, listProductsQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		listProductIds, ok := listProductsRes["rows"].([]map[string]interface{})
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you haven't buy any product",
			})
			return
		}
		boughtThis := false
		for _, pid := range listProductIds {
			if fmt.Sprint(pid["id"]) == productId && fmt.Sprint(pid["version"]) == productVersion {
				boughtThis = true
			}
		}
		if !boughtThis {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you haven't buy this product or selected version",
			})
			return
		}

		getProductQuery := fmt.Sprintf(`
		select * from products 
		where id=%s;`, productId)
		productRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, getProductQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		productRows, ok := productRes["rows"].([]map[string]interface{})
		if !ok || len(productRows) != 1 {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "products table isn't in correct state",
			})
			return
		}
		productMap := productRows[0]
		tableProductBytes, err := json.Marshal(productMap)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
		}
		var tableProduct productDTO
		err = json.Unmarshal(tableProductBytes, &tableProduct)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
		}

		var productFileNames []string
		if productVersion == "-1" {
			productFileNames = tableProduct.FileNames
		} else {
			for _, v := range tableProduct.Versions.Versions {
				if fmt.Sprint(v.Id) == productVersion {
					productFileNames = v.FileNames
					break
				}
			}
		}

		// create pre-sign url for all product files
		files := make([]map[string]interface{}, 0)
		for _, fileName := range productFileNames {
			// all links will expires in 24h or 24*60*60 seconds
			expiresIn := fmt.Sprintf("%d", 24*60*60)
			linkInfo, err := ec.ObjectstoreService.GetPresignUrl(accountId, projectTag, fileName, expiresIn)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
				return
			}
			fileInfo, err := ec.ObjectstoreService.GetObject(accountId, projectTag, fileName)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
				return
			}
			linkInfo["display_name"] = fileInfo.DisplayName
			linkInfo["file_name"] = fileName
			files = append(files, linkInfo)
		}
		productMap["files"] = files

		c.JSON(http.StatusOK, productMap)
	}
}
