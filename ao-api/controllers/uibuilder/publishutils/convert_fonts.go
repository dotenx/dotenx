package publishutils

import (
	"fmt"
	"strings"
)

func convertFonts(fonts map[string]interface{}) (string, error) {

	converted := strings.Builder{}

	for _, url := range fonts {
		converted.WriteString(fmt.Sprintf("<link rel=\"stylesheet\" href=\"%s\" />", url))
	}

	return converted.String(), nil
}
