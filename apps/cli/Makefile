.PHONY: dev clean

APP_NAME := app
DIST_DIR := dist

ARGS ?=

dev: $(DIST_DIR)/$(APP_NAME)
	@./$(DIST_DIR)/$(APP_NAME) $(ARGS)

$(DIST_DIR)/$(APP_NAME): clean
	@mkdir -p $(DIST_DIR)
	@go build -o $(DIST_DIR)/$(APP_NAME)

clean:
	@rm -rf $(DIST_DIR)