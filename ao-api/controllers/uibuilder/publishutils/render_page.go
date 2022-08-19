package publishutils

import (
	"encoding/json"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/models"
)

func RenderPage(page models.UIPage) (html, scripts, styles string, err error) {
	var parsed map[string]interface{}
	json.Unmarshal([]byte(page.Content), &parsed)

	convertedPage, convertedScripts, convertedStyles, err := convertToHTML(parsed)
	fmt.Println(convertedPage, convertedScripts, convertedStyles)

	// err = WriteToFile("./"+page.Name+".html", convertedPage)
	// if err != nil {
	// 	logrus.Error(err.Error())
	// }
	// err = WriteToFile("./"+page.Name+".js", convertedScripts)
	// if err != nil {
	// 	logrus.Error(err.Error())
	// }
	// err = WriteToFile("./"+page.Name+".css", convertedStyles)
	// if err != nil {
	// 	logrus.Error(err.Error())
	// }
	return convertedPage, convertedScripts, convertedStyles, err
}
