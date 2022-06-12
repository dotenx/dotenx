package authorStore

import (
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
)

type AuthorStore interface {
	IncrementUsedTimes(author, Type, name string) error
}

type authorStore struct {
	db *db.DB
}

func New(db *db.DB) AuthorStore {
	return &authorStore{db: db}
}

var checkExistence = `
SELECT count(*) FROM author_state
WHERE author = $1 and type = $2 and name = $3;
`
var insertUsedTimes = `
INSERT INTO author_state (author, type, name, used_times)
VALUES ($1, $2, $3, $4)
`
var updateUsedTimes = `
UPDATE author_state 
   SET used_times = used_times + 1
WHERE author = $1 and type = $2 and name = $3;
`

func (store *authorStore) IncrementUsedTimes(author, Type, name string) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = checkExistence
	default:
		return fmt.Errorf("driver not supported")
	}
	var count int
	err := store.db.Connection.QueryRow(stmt, author, Type, name).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		res, err := store.db.Connection.Exec(updateUsedTimes, author, Type, name)
		if err != nil {
			return err
		}
		if count, _ := res.RowsAffected(); count == 0 {
			return fmt.Errorf("can not update author used times, try again")
		}
		return nil
	} else {
		res, err := store.db.Connection.Exec(insertUsedTimes, author, Type, name, 1)
		if err != nil {
			return err
		}
		if count, _ := res.RowsAffected(); count == 0 {
			return fmt.Errorf("can not add author used times, try again")
		}
		return nil
	}

}
