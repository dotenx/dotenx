package db

import (
	"database/sql"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/db/migrate/postgresql"
	"github.com/go-redis/redis"
	"github.com/jmoiron/sqlx"
)

// Driver defines the database driver.
type Driver int

// Database driver enums.
const (
	Postgres = iota + 1
	Mysql
)

// Connect to a database and verify with a ping.
func Connect(driver, connStr string) (*DB, error) {
	db, err := sql.Open(driver, connStr)
	if err != nil {
		return nil, err
	}
	switch driver {
	case "mysql":
		db.SetMaxIdleConns(0)
	}
	if err := pingDatabase(db); err != nil {
		return nil, err
	}
	if err := applyMigrations(db, driver); err != nil {
		return nil, err
	}

	if err := applySeeds(db, driver); err != nil {
		return nil, err
	}

	var engine Driver
	switch driver {
	case "postgres":
		engine = Postgres
	case "mysql":
		engine = Mysql
	}

	return &DB{
		Connection: sqlx.NewDb(db, driver),
		Driver:     engine,
	}, nil
}

func RedisConnect(opt *redis.Options) (*redis.Client, error) {
	rdb := redis.NewClient(opt)
	err := rdb.Set("healthCheck", "OK", 1*time.Second).Err()
	val, _ := rdb.Get("healthCheck").Result()
	log.Println("healthCheck of redis -->", val)
	if err != nil {
		return nil, err
	}
	return rdb, nil
}

// helper function to ping the database with backoff to ensure
// a connection can be established before we proceed with the
// database setup and migration.
func pingDatabase(db *sql.DB) (err error) {
	for i := 0; i < 30; i++ {
		err = db.Ping()
		if err == nil {
			return
		}
		time.Sleep(time.Second)
	}
	return
}

// helper function to setup the database by performing automated
// database migration steps.
func applyMigrations(db *sql.DB, driver string) error {
	switch driver {
	case "postgres":
		return postgresql.Migrate(db)
	default:
		return postgresql.Migrate(db)
	}
}

func applySeeds(db *sql.DB, driver string) error {
	switch driver {
	case "postgres":
		return postgresql.Seed(db)
	default:
		return postgresql.Seed(db)
	}
}

// DB is a pool of zero or more underlying connections to
// the drone database.
type DB struct {
	Connection *sqlx.DB
	Driver     Driver
}
