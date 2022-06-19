package oauthStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

type OauthStore interface {
	AddUserProvider(ctx context.Context, userProvider models.UserProvider) error
	DeleteUserProvider(ctx context.Context, accountId, userProviderName string) error
	GetUserProviderByName(ctx context.Context, accountId, name string) (models.UserProvider, error)
	GetUserProviderByTag(ctx context.Context, tag string) (models.UserProvider, error)
	UpdateUserProvider(ctx context.Context, userProvider models.UserProvider) error
	GetAllUserProviders(ctx context.Context, accountId string) ([]models.UserProvider, error)
}

type oauthStore struct {
	db *db.DB
}

func New(db *db.DB) OauthStore {
	return &oauthStore{db: db}
}

func (store *oauthStore) AddUserProvider(ctx context.Context, userProvider models.UserProvider) error {

	var cnt int
	err := store.db.Connection.Get(&cnt, countExistingUserProviderStmt, userProvider.AccountId, userProvider.Name)
	if err != nil {
		return err
	}
	if cnt != 0 {
		return errors.New("provider already created")
	}

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = insertUserProviderStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, userProvider.AccountId, userProvider.Name,
		userProvider.Type, userProvider.Key, userProvider.Secret, userProvider.DirectUrl,
		userProvider.Scopes, userProvider.FrontEndUrl, userProvider.Tag)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not add provider, try again")
	}
	return nil
}

func (store *oauthStore) DeleteUserProvider(ctx context.Context, accountId, userProviderName string) error {

	var cnt int
	err := store.db.Connection.Get(&cnt, countExistingUserProviderStmt, accountId, userProviderName)
	if err != nil {
		return err
	}
	if cnt == 0 {
		return errors.New("provider not found")
	}

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteUserProviderStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, userProviderName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not delete provider")
	}
	return nil
}

func (store *oauthStore) GetUserProviderByName(ctx context.Context, accountId, userProviderName string) (models.UserProvider, error) {

	var cnt int
	err := store.db.Connection.Get(&cnt, countExistingUserProviderStmt, accountId, userProviderName)
	if err != nil {
		return models.UserProvider{}, err
	}
	if cnt == 0 {
		return models.UserProvider{}, errors.New("provider not found")
	}

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getUserProviderStmt
	default:
		return models.UserProvider{}, fmt.Errorf("driver not supported")
	}
	res := models.UserProvider{}
	err = store.db.Connection.QueryRowx(stmt, accountId, userProviderName).StructScan(&res)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("provider not found")
		}
		return models.UserProvider{}, err
	}
	return res, err
}

func (store *oauthStore) GetUserProviderByTag(ctx context.Context, tag string) (models.UserProvider, error) {
	var cnt int
	err := store.db.Connection.Get(&cnt, countExistingUserProviderByTagStmt, tag)
	if err != nil {
		return models.UserProvider{}, err
	}
	if cnt == 0 {
		return models.UserProvider{}, errors.New("provider not found")
	}

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getUserProviderByTagStmt
	default:
		return models.UserProvider{}, fmt.Errorf("driver not supported")
	}
	res := models.UserProvider{}
	err = store.db.Connection.QueryRowx(stmt, tag).StructScan(&res)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("provider not found")
		}
		return models.UserProvider{}, err
	}
	return res, err
}

func (store *oauthStore) UpdateUserProvider(ctx context.Context, userProvider models.UserProvider) error {
	var cnt int
	err := store.db.Connection.Get(&cnt, countExistingUserProviderStmt, userProvider.AccountId, userProvider.Name)
	if err != nil {
		return err
	}
	if cnt == 0 {
		return errors.New("provider not found")
	}

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateUserProviderStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, userProvider.Type, userProvider.Key, userProvider.Secret,
		userProvider.DirectUrl, userProvider.Scopes, userProvider.FrontEndUrl, userProvider.AccountId, userProvider.Name)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not add provider, try again")
	}
	return nil
}

func (store *oauthStore) GetAllUserProviders(ctx context.Context, accountId string) ([]models.UserProvider, error) {
	providers := make([]models.UserProvider, 0)
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getAllUserProvidersStmt, accountId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur models.UserProvider
			rows.Scan(&cur.AccountId, &cur.Name, &cur.Type, &cur.DirectUrl, &cur.Scopes, &cur.FrontEndUrl, &cur.Tag)
			if err != nil {
				return providers, err
			}
			providers = append(providers, cur)
		}
	}
	return providers, nil
}

var countExistingUserProviderStmt = `
SELECT count(*) FROM user_provider
WHERE account_id = $1 and name = $2;
`

var countExistingUserProviderByTagStmt = `
SELECT count(*) FROM user_provider
WHERE tag = $1;
`

var insertUserProviderStmt = `
INSERT INTO user_provider (account_id, name, type, key, secret, direct_url, scopes, front_end_url, tag)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`

var deleteUserProviderStmt = `
DELETE FROM user_provider 
WHERE account_id = $1 and name = $2;
`

var getUserProviderStmt = `
SELECT * FROM user_provider 
WHERE account_id = $1 and name = $2;
`

var getUserProviderByTagStmt = `
SELECT * FROM user_provider 
WHERE tag = $1;
`

var updateUserProviderStmt = `
UPDATE user_provider
SET    type = $1, key = $2, secret = $3, direct_url = $4, scopes = $5, front_end_url = $6
WHERE  account_id = $7 and name = $8;
`

var getAllUserProvidersStmt = `
SELECT account_id, name, type, direct_url, scopes, front_end_url, tag FROM user_provider 
WHERE account_id = $1;
`
