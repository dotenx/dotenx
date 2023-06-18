package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

var nginxTempConf = `
server {
    listen 80;
    # listen [::]:80 default_server;
    # root /var/www/html;
    server_name %s;
    return 301 $scheme://www.%s$request_uri;
}
`

func main() {
	r := gin.Default()
	r.POST("/domain", func(c *gin.Context) {

		var body struct {
			Domain string `json:"domain" binding:"required"`
		}
		err := c.ShouldBindJSON(&body)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "can't find domain in body",
			})
			return
		}
		fmt.Println("your domain is:", body.Domain)
		domain := strings.TrimPrefix(body.Domain, "www.")

		nginxConf := fmt.Sprintf(nginxTempConf, domain, domain)
		err = os.WriteFile("/etc/nginx/conf.d/"+fmt.Sprintf("www.%s.conf", domain), []byte(nginxConf), 0777)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "can't config nginx",
			})
			return
		}

		reloadNginxCmd := exec.Command("sudo", "systemctl", "reload", "nginx")
		reloadNginxCmdOutput, err := reloadNginxCmd.Output()
		log.Println(string(reloadNginxCmdOutput))
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "can't reload nginx",
			})
			return
		}

		certbotCmd := exec.Command("sudo", "certbot", "--nginx", "-d", domain)
		certbotCmdOutput, err := certbotCmd.Output()
		log.Println(string(certbotCmdOutput))
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "can't get/validate certificate from certbot",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "OK",
		})
	})
	r.Run(":8080") // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
