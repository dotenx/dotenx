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

	return convertedPage, convertedScripts, convertedStyles, err
}
