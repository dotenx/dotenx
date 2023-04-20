package uibuilderStore

import (
	"context"
	"database/sql"
	"fmt"
	"math"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) AddPageHistory(ctx context.Context, pageHistory models.UIPageHistory) error {
	selectNumberOfPages := `
	SELECT count(*) FROM ui_pages_history
	WHERE account_id = $1 AND project_tag = $2 AND name = $3;
	`
	selectPages := `
	SELECT saved_at FROM ui_pages_history
	WHERE account_id = $1 AND project_tag = $2 AND name = $3
	ORDER BY saved_at;
	`
	deletePageHistory := `
	DELETE FROM ui_pages_history
	WHERE account_id = $1 AND project_tag = $2 AND name = $3 AND saved_at = $4;
	`
	addPageHistory := `
	INSERT INTO ui_pages_history (name, account_id, project_tag, content)
	VALUES ($1, $2, $3, $4);
	`
	var stmt1, stmt2, stmt3, stmt4 string
	switch store.db.Driver {
	case db.Postgres:
		stmt1 = selectNumberOfPages
		stmt2 = selectPages
		stmt3 = deletePageHistory
		stmt4 = addPageHistory
	default:
		return fmt.Errorf("driver not supported")
	}

	var numberOfPages int
	err := store.db.Connection.QueryRow(stmt1, pageHistory.AccountId, pageHistory.ProjectTag, pageHistory.Name).Scan(&numberOfPages)
	if err != nil {
		logrus.Error(err)
		if err == sql.ErrNoRows {
			err = utils.ErrPageNotFound
		}
		return err
	}

	var pages []models.UIPageHistory
	err = store.db.Connection.Select(&pages, stmt2, pageHistory.AccountId, pageHistory.ProjectTag, pageHistory.Name)
	if err != nil && err != sql.ErrNoRows {
		logrus.Error(err.Error())
		return err
	}

	pageHistoryLimitation := config.Configs.App.UiPageHistoryLimitation
	for i := 0; i < int(math.Max(float64(0), float64(numberOfPages-pageHistoryLimitation+1))); i++ {
		_, err = store.db.Connection.Exec(stmt3, pageHistory.AccountId, pageHistory.ProjectTag, pageHistory.Name, pages[i].SavedAt.Format("2006-01-02 15:04:05.000000"))
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}

	_, err = store.db.Connection.Exec(stmt4, pageHistory.Name, pageHistory.AccountId, pageHistory.ProjectTag, pageHistory.Content)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return err
}
