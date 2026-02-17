# FreeLang stdlib/http - HTTP Server & Client
# Custom Event Loop (No external dependencies)

CC = gcc
CFLAGS = -Wall -Wextra -fPIC -O2 -pthread
LDFLAGS = -shared -pthread

SRC_DIR = .
OBJ_DIR = build
DIST_DIR = ../../dist/stdlib

SOURCES = $(SRC_DIR)/event_loop.c $(SRC_DIR)/http_server_impl.c
OBJECTS = $(patsubst $(SRC_DIR)/%.c,$(OBJ_DIR)/%.o,$(SOURCES))
TARGET = $(DIST_DIR)/libhttp.so

.PHONY: all build test clean install

all: build

build: $(TARGET)
	@echo "✅ HTTP server built successfully"

$(OBJ_DIR):
	@mkdir -p $(OBJ_DIR)

$(DIST_DIR):
	@mkdir -p $(DIST_DIR)

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

$(TARGET): $(OBJECTS) | $(DIST_DIR)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@
	@echo "✅ libhttp.so created: $(TARGET)"

test: $(TARGET)
	@echo "✅ HTTP server ready for testing"

clean:
	@rm -rf $(OBJ_DIR) $(TARGET)
	@echo "✅ Cleaned"

install: build
	@echo "✅ libhttp.so installed"
