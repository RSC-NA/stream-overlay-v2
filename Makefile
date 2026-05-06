COMPOSE := docker compose
SERVICE := overlay
CONTAINER := stream-overlay-v2

.PHONY: help build up up-build down restart logs ps shell status health clean clean-all

help:
	@echo "Available targets:"
	@echo "  make build      - Build docker images"
	@echo "  make up         - Start containers in detached mode"
	@echo "  make up-build   - Rebuild images and start containers"
	@echo "  make down       - Stop and remove containers"
	@echo "  make restart    - Restart containers"
	@echo "  make logs       - Tail container logs"
	@echo "  make ps         - Show container status"
	@echo "  make shell      - Open shell in the overlay container"
	@echo "  make status     - Alias for ps"
	@echo "  make health     - Show health status of main container"
	@echo "  make clean      - Stop and remove containers + orphans"
	@echo "  make clean-all  - clean + remove volumes and local images"

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

up-build:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec $(SERVICE) sh

status: ps

health:
	@docker inspect --format='{{.State.Health.Status}}' $(CONTAINER)

clean:
	$(COMPOSE) down --remove-orphans

clean-all:
	$(COMPOSE) down --remove-orphans --volumes --rmi local
