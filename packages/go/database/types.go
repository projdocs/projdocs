package database

type PublicOrganizationsSelect struct {
  DefaultPermissionsId string  `json:"default_permissions_id"`
  Display              string  `json:"display"`
  FolderId             *string `json:"folder_id"`
  Id                   string  `json:"id"`
  StorageProvidersId   string  `json:"storage_providers_id"`
}

type PublicOrganizationsInsert struct {
  DefaultPermissionsId string  `json:"default_permissions_id"`
  Display              string  `json:"display"`
  FolderId             *string `json:"folder_id"`
  Id                   *string `json:"id"`
  StorageProvidersId   string  `json:"storage_providers_id"`
}

type PublicOrganizationsUpdate struct {
  DefaultPermissionsId *string `json:"default_permissions_id"`
  Display              *string `json:"display"`
  FolderId             *string `json:"folder_id"`
  Id                   *string `json:"id"`
  StorageProvidersId   *string `json:"storage_providers_id"`
}

type PublicMembersSelect struct {
  Id            string `json:"id"`
  PermissionsId string `json:"permissions_id"`
  UserId        string `json:"user_id"`
}

type PublicMembersInsert struct {
  Id            *string `json:"id"`
  PermissionsId string  `json:"permissions_id"`
  UserId        string  `json:"user_id"`
}

type PublicMembersUpdate struct {
  Id            *string `json:"id"`
  PermissionsId *string `json:"permissions_id"`
  UserId        *string `json:"user_id"`
}

type PublicProfilesSelect struct {
  FirstName         string  `json:"first_name"`
  FullName          string  `json:"full_name"`
  Id                string  `json:"id"`
  LastName          string  `json:"last_name"`
  OrganizationId    string  `json:"organization_id"`
  ProfilePictureUrl *string `json:"profile_picture_url"`
  UserId            string  `json:"user_id"`
}

type PublicProfilesInsert struct {
  FirstName         string  `json:"first_name"`
  FullName          *string `json:"full_name"`
  Id                *string `json:"id"`
  LastName          string  `json:"last_name"`
  OrganizationId    string  `json:"organization_id"`
  ProfilePictureUrl *string `json:"profile_picture_url"`
  UserId            string  `json:"user_id"`
}

type PublicProfilesUpdate struct {
  FirstName         *string `json:"first_name"`
  FullName          *string `json:"full_name"`
  Id                *string `json:"id"`
  LastName          *string `json:"last_name"`
  OrganizationId    *string `json:"organization_id"`
  ProfilePictureUrl *string `json:"profile_picture_url"`
  UserId            *string `json:"user_id"`
}

type PublicStorageProvidersSelect struct {
  IsMigrationLocked bool        `json:"__is_migration_locked"`
  CreatedAt         string      `json:"created_at"`
  Data              interface{} `json:"data"`
  Id                string      `json:"id"`
  IsValid           bool        `json:"is_valid"`
  Type              string      `json:"type"`
}

type PublicStorageProvidersInsert struct {
  IsMigrationLocked *bool       `json:"__is_migration_locked"`
  CreatedAt         *string     `json:"created_at"`
  Data              interface{} `json:"data"`
  Id                *string     `json:"id"`
  IsValid           *bool       `json:"is_valid"`
  Type              *string     `json:"type"`
}

type PublicStorageProvidersUpdate struct {
  IsMigrationLocked *bool       `json:"__is_migration_locked"`
  CreatedAt         *string     `json:"created_at"`
  Data              interface{} `json:"data"`
  Id                *string     `json:"id"`
  IsValid           *bool       `json:"is_valid"`
  Type              *string     `json:"type"`
}

type PublicClientsSelect struct {
  FullTextSearch interface{} `json:"__full_text_search"`
  CreatedAt      string      `json:"created_at"`
  Id             string      `json:"id"`
  Name           string      `json:"name"`
  Number         int64       `json:"number"`
  OrganizationId string      `json:"organization_id"`
}

type PublicClientsInsert struct {
  FullTextSearch interface{} `json:"__full_text_search"`
  CreatedAt      *string     `json:"created_at"`
  Id             *string     `json:"id"`
  Name           string      `json:"name"`
  Number         *int64      `json:"number"`
  OrganizationId string      `json:"organization_id"`
}

type PublicClientsUpdate struct {
  FullTextSearch interface{} `json:"__full_text_search"`
  CreatedAt      *string     `json:"created_at"`
  Id             *string     `json:"id"`
  Name           *string     `json:"name"`
  Number         *int64      `json:"number"`
  OrganizationId *string     `json:"organization_id"`
}

type PublicProjectsSelect struct {
  FullTextSearch interface{} `json:"__full_text_search"`
  CreatedAt      string      `json:"created_at"`
  Display        string      `json:"display"`
  Id             string      `json:"id"`
  Number         int64       `json:"number"`
  OrganizationId string      `json:"organization_id"`
}

type PublicProjectsInsert struct {
  FullTextSearch interface{} `json:"__full_text_search"`
  CreatedAt      *string     `json:"created_at"`
  Display        *string     `json:"display"`
  Id             *string     `json:"id"`
  Number         *int64      `json:"number"`
  OrganizationId string      `json:"organization_id"`
}

type PublicProjectsUpdate struct {
  FullTextSearch interface{} `json:"__full_text_search"`
  CreatedAt      *string     `json:"created_at"`
  Display        *string     `json:"display"`
  Id             *string     `json:"id"`
  Number         *int64      `json:"number"`
  OrganizationId *string     `json:"organization_id"`
}

type PublicFavoritesSelect struct {
  ClientId  *string `json:"client_id"`
  Id        string  `json:"id"`
  ProjectId *string `json:"project_id"`
  UserId    string  `json:"user_id"`
}

type PublicFavoritesInsert struct {
  ClientId  *string `json:"client_id"`
  Id        *string `json:"id"`
  ProjectId *string `json:"project_id"`
  UserId    string  `json:"user_id"`
}

type PublicFavoritesUpdate struct {
  ClientId  *string `json:"client_id"`
  Id        *string `json:"id"`
  ProjectId *string `json:"project_id"`
  UserId    *string `json:"user_id"`
}

type PublicPermissionsSelect struct {
  IsDefaultRole  bool    `json:"__is_default_role"`
  Clients        string  `json:"clients"`
  Display        string  `json:"display"`
  Id             string  `json:"id"`
  Organization   string  `json:"organization"`
  OrganizationId *string `json:"organization_id"`
  Projects       string  `json:"projects"`
}

type PublicPermissionsInsert struct {
  IsDefaultRole  *bool   `json:"__is_default_role"`
  Clients        *string `json:"clients"`
  Display        string  `json:"display"`
  Id             *string `json:"id"`
  Organization   *string `json:"organization"`
  OrganizationId *string `json:"organization_id"`
  Projects       *string `json:"projects"`
}

type PublicPermissionsUpdate struct {
  IsDefaultRole  *bool   `json:"__is_default_role"`
  Clients        *string `json:"clients"`
  Display        *string `json:"display"`
  Id             *string `json:"id"`
  Organization   *string `json:"organization"`
  OrganizationId *string `json:"organization_id"`
  Projects       *string `json:"projects"`
}

type PublicClientsProjectsSelect struct {
  ClientId       string `json:"client_id"`
  CreatedAt      string `json:"created_at"`
  Id             string `json:"id"`
  OrganizationId string `json:"organization_id"`
  ProjectId      string `json:"project_id"`
}

type PublicClientsProjectsInsert struct {
  ClientId       string  `json:"client_id"`
  CreatedAt      *string `json:"created_at"`
  Id             *string `json:"id"`
  OrganizationId string  `json:"organization_id"`
  ProjectId      string  `json:"project_id"`
}

type PublicClientsProjectsUpdate struct {
  ClientId       *string `json:"client_id"`
  CreatedAt      *string `json:"created_at"`
  Id             *string `json:"id"`
  OrganizationId *string `json:"organization_id"`
  ProjectId      *string `json:"project_id"`
}

type PublicStorageUploadsSelect struct {
  CreatedAt         string `json:"created_at"`
  Id                string `json:"id"`
  ProviderId        string `json:"provider_id"`
  StorageProviderId string `json:"storage_provider_id"`
}

type PublicStorageUploadsInsert struct {
  CreatedAt         *string `json:"created_at"`
  Id                *string `json:"id"`
  ProviderId        string  `json:"provider_id"`
  StorageProviderId string  `json:"storage_provider_id"`
}

type PublicStorageUploadsUpdate struct {
  CreatedAt         *string `json:"created_at"`
  Id                *string `json:"id"`
  ProviderId        *string `json:"provider_id"`
  StorageProviderId *string `json:"storage_provider_id"`
}

type PublicFilesSelect struct {
  CreatedAt string `json:"created_at"`
  FolderId  string `json:"folder_id"`
  Id        string `json:"id"`
  Number    int64  `json:"number"`
}

type PublicFilesInsert struct {
  CreatedAt *string `json:"created_at"`
  FolderId  string  `json:"folder_id"`
  Id        *string `json:"id"`
  Number    *int64  `json:"number"`
}

type PublicFilesUpdate struct {
  CreatedAt *string `json:"created_at"`
  FolderId  *string `json:"folder_id"`
  Id        *string `json:"id"`
  Number    *int64  `json:"number"`
}

type PublicFilesVersionsSelect struct {
  CreatedAt        string `json:"created_at"`
  FilesId          string `json:"files_id"`
  Id               string `json:"id"`
  StorageUploadsId string `json:"storage_uploads_id"`
}

type PublicFilesVersionsInsert struct {
  CreatedAt        *string `json:"created_at"`
  FilesId          string  `json:"files_id"`
  Id               *string `json:"id"`
  StorageUploadsId string  `json:"storage_uploads_id"`
}

type PublicFilesVersionsUpdate struct {
  CreatedAt        *string `json:"created_at"`
  FilesId          *string `json:"files_id"`
  Id               *string `json:"id"`
  StorageUploadsId *string `json:"storage_uploads_id"`
}

type PublicFoldersSelect struct {
  ClientId       *string `json:"client_id"`
  CreatedAt      string  `json:"created_at"`
  FolderId       *string `json:"folder_id"`
  Id             string  `json:"id"`
  MemberId       *string `json:"member_id"`
  Name           string  `json:"name"`
  OrganizationId *string `json:"organization_id"`
  ProjectId      *string `json:"project_id"`
}

type PublicFoldersInsert struct {
  ClientId       *string `json:"client_id"`
  CreatedAt      *string `json:"created_at"`
  FolderId       *string `json:"folder_id"`
  Id             *string `json:"id"`
  MemberId       *string `json:"member_id"`
  Name           string  `json:"name"`
  OrganizationId *string `json:"organization_id"`
  ProjectId      *string `json:"project_id"`
}

type PublicFoldersUpdate struct {
  ClientId       *string `json:"client_id"`
  CreatedAt      *string `json:"created_at"`
  FolderId       *string `json:"folder_id"`
  Id             *string `json:"id"`
  MemberId       *string `json:"member_id"`
  Name           *string `json:"name"`
  OrganizationId *string `json:"organization_id"`
  ProjectId      *string `json:"project_id"`
}
