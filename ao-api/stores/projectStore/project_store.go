package projectStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) ProjectStore {
	return &projectStore{db}
}

type ProjectStore interface {
	AddProject(ctx context.Context, accountId string, project models.Project) error
	CreateProjectDatabase(ctx context.Context, accountId string, projectName string) error
	ListProjects(ctx context.Context, accountId string) ([]models.Project, error)
	GetProject(ctx context.Context, accountId string, projectName string) (models.Project, error)
	GetProjectByTag(ctx context.Context, tag string) (models.Project, error)
}

type projectStore struct {
	db *db.DB
}
