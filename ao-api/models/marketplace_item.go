package models

import (
	"time"

	"github.com/lib/pq"
)

type MarketplaceItem struct {
	Id               int                      `db:"id" json:"id"`
	AccountId        string                   `db:"creator_account_id" json:"-"`
	Type             string                   `db:"item_type" json:"type"`
	Category         string                   `db:"category" json:"category"`
	Title            string                   `db:"title" json:"title"`
	ShortDescription string                   `db:"short_description" json:"shortDescription"`
	Description      string                   `db:"description" json:"description"`
	Enabled          bool                     `db:"enabled" json:"enabled"`
	Price            int                      `db:"price" json:"price"`
	ImageUrl         string                   `db:"image_url" json:"imageUrl"`
	PreviewUrl       string                   `db:"preview_url" json:"previewUrl"`
	Features         []MarketplaceItemFeature `db:"-" json:"features"`
	FeaturesForDb    []byte                   `db:"features" json:"-"`
	CreatedAt        time.Time                `db:"created_at" json:"createdAt"`
	UpdatedAtForDb   pq.NullTime              `db:"updated_at" json:"-"`
	UpdatedAt        time.Time                `db:"-" json:"updatedAt"`
	ProjectName      string                   `db:"project_name" json:"-"`
	ProjectTag       string                   `db:"-" json:"project_tag"`
	ProjectHasDb     bool                     `db:"-" json:"project_has_db"`
	ComponentName    string                   `db:"component_name" json:"-"`
	S3Key            string                   `db:"s3_key" json:"-"`
}

type MarketplaceItemFeature struct {
	Icon        string `db:"icon" json:"icon"`
	Description string `db:"description" json:"description"`
}

const (
	CategoryProject        = "projectItem"
	CategoryTask           = "taskItem"
	CategoryTrigger        = "triggerItem"
	CategoryUIComponent    = "uiComponentItem"
	CategoryUIDesignSystem = "uiDesignSystemItem"
)
