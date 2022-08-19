package publishutils

import "os"

// Create the file and write the content to it
func WriteToFile(fileName string, content string) error {
	f, err := os.Create(fileName)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = f.WriteString(content)
	if err != nil {
		return err
	}
	return nil
}
