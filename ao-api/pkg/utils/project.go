package utils

import "strings"

func GetProjectDatabaseName(accountId string, projectName string) string {
	return "u" + strings.ReplaceAll(accountId, "-", "_") + "__" + projectName
}
