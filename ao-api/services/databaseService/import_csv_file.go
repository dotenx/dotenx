package databaseService

// import (
// 	"encoding/csv"
// 	"errors"
// 	"mime/multipart"

// 	"github.com/sirupsen/logrus"
// )

// func (ds *databaseService) ImportCsvFile(file *multipart.FileHeader, accountId string, projectName string, projectTag string, tableName string) error {
// 	f, err := file.Open()
// 	if err != nil {
// 		logrus.Error(err.Error())
// 		return err
// 	}
// 	defer f.Close()

// 	csvReader := csv.NewReader(f)
// 	data, err := csvReader.ReadAll()
// 	if err != nil {
// 		logrus.Error(err.Error())
// 		return err
// 	}
// 	if len(data) < 2 {
// 		return errors.New("csv file is empty")
// 	}
// 	columns := data[0]
// 	rows := data[1:]
// 	rowsMap := make([]map[string]interface{}, 0)
// 	for _, row := range rows {
// 		rowMap := make(map[string]interface{})
// 		for j, c := range columns {
// 			if j < len(row) {
// 				rowMap[c] = row[j]
// 			}
// 		}
// 		rowsMap = append(rowsMap, rowMap)
// 	}

// 	errExist := false
// 	for _, rowMap := range rowsMap {
// 		insertErr := ds.InsertRow("", projectTag, tableName, rowMap)
// 		if insertErr != nil {
// 			errExist = true
// 		}
// 	}
// 	if errExist {
// 		return errors.New("some/all rows can't be added successfully")
// 	} else {
// 		return nil
// 	}
// }
