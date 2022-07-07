package postgresql

import (
	"database/sql"
	"log"
	"os"
	"strings"

	"github.com/dotenx/dotenx/ao-api/models"
)

var seeds = []string{
	insertTaskStatusValues,
}

func Seed(db *sql.DB) error {
	for _, seed := range seeds {
		if !strings.HasSuffix(os.Args[0], ".test") {
			log.Println(seed)
		}
		if _, err := db.Exec(seed); err != nil {
			return err
		}
	}
	return nil
}

func format(values []string) string {
	var str strings.Builder
	for i, v := range values {
		str.WriteString(`('` + v + `')`)
		if i < len(values)-1 {
			str.WriteString(",")
		}
	}
	return str.String()
}

var insertTaskStatusValues = `
INSERT INTO task_status (name) VALUES ` + format(models.TaskStatusValues()) + ` 
ON CONFLICT (name) 
DO NOTHING;
`
