package pipelineStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
)

func (ps *pipelineStore) GetAllTemplateChildren(context context.Context, accountId, project, name string) (pipelines []models.Pipeline, err error) {
	res := make([]models.Pipeline, 0)
	switch ps.db.Driver {
	case db.Postgres:
		rows, err := ps.db.Connection.Queryx(get_all_child_pipelines, accountId, project, name)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur struct {
				Id            int            `db:"id"`
				Name          string         `db:"name"`
				Endpoint      string         `db:"endpoint"`
				AccountId     string         `db:"account_id"`
				IsActive      bool           `db:"is_active"`
				IsTemplate    bool           `db:"is_template"`
				IsInteraction bool           `db:"is_interaction"`
				IsPublic      bool           `db:"is_public"`
				UserGroups    pq.StringArray `db:"user_groups"`
				ProjectName   string         `db:"project_name"`
				ParentId      int            `db:"parent_id"`
			}
			rows.StructScan(&cur)
			if err != nil {
				return nil, err
			}
			res = append(res, models.Pipeline{
				Id:            cur.Id,
				Name:          cur.Name,
				Endpoint:      cur.Endpoint,
				AccountId:     cur.AccountId,
				IsActive:      cur.IsActive,
				IsTemplate:    cur.IsTemplate,
				IsInteraction: cur.IsInteraction,
				IsPublic:      cur.IsPublic,
				UserGroups:    ([]string)(cur.UserGroups),
				ProjectName:   cur.ProjectName,
			})
		}
	}
	return res, nil

}

const get_all_child_pipelines = `
SELECT * FROM pipelines
WHERE account_id = $1 AND project_name = $2 AND name = $3
`
