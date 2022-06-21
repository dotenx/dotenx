package utils

func GetProjectDatabaseName(accountId string, projectName string) string {
	return "u" + accountId + "__" + projectName
}
