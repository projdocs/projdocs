APP_NAME := federation
DIST_DIR := dist
CMD := .

GO := go
GOFLAGS := -trimpath
LDFLAGS := -s -w

PLATFORMS := \
	darwin/amd64 \
	darwin/arm64 \
	linux/amd64 \
	linux/arm64 \
	windows/amd64

# Host macOS platform (matches PLATFORMS format)
HOST_DARWIN := darwin/$(shell $(GO) env GOARCH)

.PHONY: all clean build macos $(PLATFORMS)

all: build

build: clean $(PLATFORMS)

migration:
	@set -eu; \
	printf "Migration name: "; \
	IFS= read -r name; \
	slug=$$(printf "%s" "$$name" \
		| tr '[:upper:]' '[:lower:]' \
		| sed -E 's/[^a-z0-9 _-]+//g; s/[ _-]+/_/g; s/^_+|_+$$//g'); \
	[ -n "$$slug" ] || slug=migration; \
	ts=$$(date -u +%Y%m%d%H%M%S); \
	dir=internal/db/migrations; \
	file="$$dir/$${ts}_$${slug}.sql"; \
	mkdir -p "$$dir"; \
	if [ -e "$$file" ]; then echo "exists: $$file" >&2; exit 1; fi; \
	created=$$(date -u +%Y-%m-%dT%H:%M:%SZ); \
	{ \
		printf -- "-- Migration: %s\n" "$$slug"; \
		printf -- "-- Created: %s UTC\n\n" "$$created"; \
	} >"$$file"; \
	git add internal/db/migrations/*; \
	echo "Created migration: $$file"

# Build the host macOS binary using the shared rule, then run it.
macos: $(HOST_DARWIN)
	@echo "========== Running $(APP_NAME) ($(HOST_DARWIN)) =========="
	@$(DIST_DIR)/$(APP_NAME)-darwin-$(shell $(GO) env GOARCH) $(ARGS)
	@echo "======================================================="

$(PLATFORMS):
	@echo "Building $(APP_NAME) for $@"
	@mkdir -p $(DIST_DIR)
	@OS=$(word 1,$(subst /, ,$@)); \
	ARCH=$(word 2,$(subst /, ,$@)); \
	OUT=$(DIST_DIR)/$(APP_NAME)-$$OS-$$ARCH; \
	if [ "$$OS" = "windows" ]; then OUT=$$OUT.exe; fi; \
	CGO_ENABLED=0 GOOS=$$OS GOARCH=$$ARCH \
		$(GO) build $(GOFLAGS) -ldflags "$(LDFLAGS)" \
		-o $$OUT $(CMD)

clean:
	@rm -rf $(DIST_DIR)