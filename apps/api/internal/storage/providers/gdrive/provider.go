package gdrive

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/projdocs/projdocs/apps/api/internal/storage/types"
	"github.com/tus/tusd/v2/pkg/handler"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

// ServiceAccountKey mirrors the JSON structure of a Google service account key.
type ServiceAccountKey struct {
	Type                    string `json:"type"`
	ProjectID               string `json:"project_id"`
	PrivateKeyID            string `json:"private_key_id"`
	PrivateKey              string `json:"private_key"`
	ClientEmail             string `json:"client_email"`
	ClientID                string `json:"client_id"`
	AuthURI                 string `json:"auth_uri"`
	TokenURI                string `json:"token_uri"`
	AuthProviderX509CertURL string `json:"auth_provider_x509_cert_url"`
	ClientX509CertURL       string `json:"client_x509_cert_url"`
	UniverseDomain          string `json:"universe_domain"`
}

// Config is the validated body your endpoint receives.
type Config struct {
	ParentID string            `json:"parentID"`
	JSONKey  ServiceAccountKey `json:"jsonKey"`
}

type Provider struct {
	client *drive.Service
	cfg    *Config
	http   *http.Client
}

func NewProvider(cfg *Config) (*Provider, error) {

	// get key
	keyBytes, err := json.Marshal(cfg.JSONKey)
	if err != nil {
		return nil, fmt.Errorf("marshal key: %w", err)
	}

	// get raw http client
	ts, err := google.CredentialsFromJSONWithType(context.Background(), keyBytes, google.ServiceAccount, drive.DriveScope)
	if err != nil {
		return nil, fmt.Errorf("credentials: %w", err)
	}
	hc := oauth2.NewClient(context.Background(), ts.TokenSource)

	// get service
	svc, err := drive.NewService(context.Background(),
		option.WithHTTPClient(hc),
		option.WithScopes(drive.DriveScope),
	)
	if err != nil {
		return nil, fmt.Errorf("create drive service: %v", err)
	}

	return &Provider{
		client: svc,
		cfg:    cfg,
		http:   hc,
	}, nil
}

func (gd *Provider) CreateFolder(ctx context.Context, parentID *string, name string, metadata map[string]string) (*string, error) {

	var parents []string
	if parentID != nil {
		parents = append(parents, *parentID)
	} else {
		parents = append(parents, gd.cfg.ParentID)
	}

	f, err := gd.client.Files.Create(&drive.File{
		Name:       name,
		MimeType:   "application/vnd.google-apps.folder",
		Parents:    parents,
		Properties: metadata,
	}).
		SupportsAllDrives(true).
		Fields("id").
		Context(ctx).
		Do()
	if err != nil {
		return nil, fmt.Errorf("create folder: %w", err)
	}

	if f == nil {
		return nil, fmt.Errorf("create folder: none returned")
	}

	return &f.Id, nil
}

func (gd *Provider) ToTusHandler(
	storageProviderId uuid.UUID,
	basePath string,
	uploadPrefix string,
	callback types.Callback,
) (*handler.Handler, error) {

	// custom composer
	composer := handler.NewStoreComposer()
	composer.UseCore(&Store{
		g:        gd,
		parentID: uploadPrefix,
	})

	return handler.NewHandler(handler.Config{
		BasePath:                basePath,
		StoreComposer:           composer,
		RespectForwardedHeaders: true,
		NotifyCompleteUploads:   true,
		PreFinishResponseCallback: func(hook handler.HookEvent) (response handler.HTTPResponse, _ error) {

			// catch errors
			defer func() {
				if r := recover(); r != nil {
					log.Printf("panic: %v", r)
					response = handler.HTTPResponse{
						StatusCode: http.StatusInternalServerError,
						Body:       `{"error":"an unexpected error occurred","data":null}`,
						Header:     handler.HTTPHeader{"Content-Type": "application/json"},
					}
				}
			}()

			fileID := hook.Upload.MetaData["fileId"] // see below
			if fileID == "" {
				response = handler.HTTPResponse{
					StatusCode: http.StatusInternalServerError,
					Body:       `{"error":"failed to retrieve object metadata (id)","data":null}`,
					Header:     handler.HTTPHeader{"Content-Type": "application/json"},
				}
				return
			}

			// fetch checksum from Drive
			file, err := gd.client.Files.Get(fileID).
				Fields("md5Checksum").
				SupportsAllDrives(true).
				Context(context.Background()).
				Do()
			if err != nil {
				response = handler.HTTPResponse{
					StatusCode: http.StatusInternalServerError,
					Body:       `{"error":"failed to retrieve object metadata (checksum)","data":null}`,
					Header:     handler.HTTPHeader{"Content-Type": "application/json"},
				}
				return
			}

			response = callback(
				fileID,
				storageProviderId,
				basePath,
				uploadPrefix,
				file.Md5Checksum,
				hook,
			)
			return
		},
	})
}
