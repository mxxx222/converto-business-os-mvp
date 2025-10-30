# 🐳 Converto Business OS - Makefile
# Modulaarinen Docker-hallinta

.PHONY: help up down logs test-smoke clean build dev prod status

# Oletusarvo
COMPOSE_FILE ?= docker-compose.modular.yml
SERVICE ?= all

# Värit
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Help
help: ## Näytä käytettävissä olevat komennot
	@echo "$(BLUE)🐳 Converto Business OS - Makefile$(NC)"
	@echo "=================================="
	@echo ""
	@echo "$(GREEN)Käytettävissä olevat komennot:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Esimerkkejä:$(NC)"
	@echo "  make up                    # Käynnistä kaikki palvelut"
	@echo "  make down                  # Pysäytä kaikki palvelut"
	@echo "  make logs svc=backend      # Näytä backend logit"
	@echo "  make test-smoke            # Suorita smoke testit"
	@echo "  make dev                   # Käynnistä kehitysympäristö"
	@echo "  make prod                  # Käynnistä tuotantoympäristö"

# Käynnistä palvelut
up: ## Käynnistä kaikki palvelut
	@echo "$(BLUE)🚀 Käynnistetään Converto Business OS...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Palvelut käynnistetty!$(NC)"
	@echo ""
	@echo "$(GREEN)Palvelut:$(NC)"
	@echo "  🌐 Marketing:    http://localhost:3000"
	@echo "  📊 Dashboard:   http://localhost:3001"
	@echo "  ⚙️  Backend:     http://localhost:8000"
	@echo "  🛠️  Dev Panel:   http://localhost:3002"
	@echo "  📊 Prometheus:  http://localhost:9090"
	@echo "  📈 Grafana:     http://localhost:3003"

# Pysäytä palvelut
down: ## Pysäytä kaikki palvelut
	@echo "$(YELLOW)🛑 Pysäytetään Converto Business OS...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Palvelut pysäytetty!$(NC)"

# Näytä logit
logs: ## Näytä palvelun logit (käytä: make logs svc=backend)
	@if [ "$(SERVICE)" = "all" ]; then \
		echo "$(BLUE)📝 Näytetään kaikkien palvelujen logit...$(NC)"; \
		docker-compose -f $(COMPOSE_FILE) logs -f; \
	else \
		echo "$(BLUE)📝 Näytetään $(SERVICE) logit...$(NC)"; \
		docker-compose -f $(COMPOSE_FILE) logs -f $(SERVICE); \
	fi

# Smoke testit
test-smoke: ## Suorita smoke testit
	@echo "$(BLUE)🧪 Suoritetaan smoke testit...$(NC)"
	@./scripts/smoke-test.sh

# Premium page testit
test-premium: ## Suorita premium page smoke testit
	@echo "$(BLUE)🧪 Suoritetaan premium page smoke testit...$(NC)"
	@./scripts/smoke-test-premium.sh

# Lighthouse performance testit
test-lighthouse: ## Suorita Lighthouse performance testit
	@echo "$(BLUE)🧪 Suoritetaan Lighthouse performance testit...$(NC)"
	@./scripts/lighthouse-test.sh

# Launch readiness check
launch-check: ## Täydellinen julkaisuvalmius-tarkistus
	@echo "$(BLUE)🚀 Suoritetaan täydellinen julkaisuvalmius-tarkistus...$(NC)"
	@make test-premium
	@make test-lighthouse
	@echo "$(GREEN)✅ Julkaisuvalmius-tarkistus valmis!$(NC)"

# Validate setup
validate-setup: ## Tarkista environment variables
	@echo "$(BLUE)🔍 Validating setup...$(NC)"
	@./scripts/validate-setup.sh

# Integration tests
test-integrations: ## Testaa backend/frontend integraatiot
	@echo "$(BLUE)🧪 Running integration tests...$(NC)"
	@./scripts/test-integrations.sh

# Dashboard tests
test-dashboard: ## Testaa dashboard toimivuus
	@echo "$(BLUE)🧪 Running dashboard tests...$(NC)"
	@./scripts/test-dashboard.sh

# Dashboard setup validation
validate-dashboard: ## Tarkista dashboard setup
	@echo "$(BLUE)🔍 Validating dashboard setup...$(NC)"
	@./scripts/validate-dashboard-setup.sh

# Puhdista Docker-resurssit
clean: ## Puhdista Docker-resurssit
	@echo "$(YELLOW)🧹 Puhdistetaan Docker-resurssit...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@docker system prune -f
	@docker volume prune -f
	@echo "$(GREEN)✅ Docker-resurssit puhdistettu!$(NC)"

# Rakenna kuvat
build: ## Rakenna kaikki Docker-kuvat
	@echo "$(BLUE)🔨 Rakennetaan Docker-kuvat...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Docker-kuvat rakennettu!$(NC)"

# Kehitysympäristö
dev: ## Käynnistä kehitysympäristö
	@echo "$(BLUE)🛠️ Käynnistetään kehitysympäristö...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  .env-tiedosto puuttuu! Kopioidaan .env.example...$(NC)"; \
		cp env.modular.example .env; \
		echo "$(YELLOW)⚠️  Muokkaa .env-tiedosto tarvittaessa!$(NC)"; \
	fi
	@make up
	@echo "$(GREEN)✅ Kehitysympäristö käynnistetty!$(NC)"

# Tuotantoympäristö
prod: ## Käynnistä tuotantoympäristö
	@echo "$(BLUE)🏭 Käynnistetään tuotantoympäristö...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ .env-tiedosto puuttuu! Luo se .env.example:sta.$(NC)"; \
		exit 1; \
	fi
	@make up
	@echo "$(GREEN)✅ Tuotantoympäristö käynnistetty!$(NC)"

# Näytä tilanne
status: ## Näytä palvelujen tilanne
	@echo "$(BLUE)📊 Palvelujen tilanne:$(NC)"
	@echo ""
	@docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(GREEN)Palvelut:$(NC)"
	@echo "  🌐 Marketing:    http://localhost:3000"
	@echo "  📊 Dashboard:   http://localhost:3001"
	@echo "  ⚙️  Backend:     http://localhost:8000"
	@echo "  🛠️  Dev Panel:   http://localhost:3002"
	@echo "  📊 Prometheus:  http://localhost:9090"
	@echo "  📈 Grafana:     http://localhost:3003"

# Tarkista terveys
health: ## Tarkista palvelujen terveys
	@echo "$(BLUE)🏥 Tarkistetaan palvelujen terveys...$(NC)"
	@curl -s -f http://localhost:8000/health >/dev/null && echo "$(GREEN)✅ Backend: Healthy$(NC)" || echo "$(RED)❌ Backend: Unhealthy$(NC)"
	@curl -s -f http://localhost:3000/health >/dev/null && echo "$(GREEN)✅ Marketing: Healthy$(NC)" || echo "$(RED)❌ Marketing: Unhealthy$(NC)"
	@curl -s -f http://localhost:3001/health >/dev/null && echo "$(GREEN)✅ Dashboard: Healthy$(NC)" || echo "$(RED)❌ Dashboard: Unhealthy$(NC)"
	@curl -s -f http://localhost:3002/health >/dev/null && echo "$(GREEN)✅ Dev Panel: Healthy$(NC)" || echo "$(RED)❌ Dev Panel: Unhealthy$(NC)"

# Käynnistä moduuli
start: ## Käynnistä moduuli (käytä: make start svc=marketing)
	@echo "$(BLUE)🚀 Käynnistetään $(SERVICE)...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d $(SERVICE)
	@echo "$(GREEN)✅ $(SERVICE) käynnistetty!$(NC)"

# Pysäytä moduuli
stop: ## Pysäytä moduuli (käytä: make stop svc=marketing)
	@echo "$(YELLOW)🛑 Pysäytetään $(SERVICE)...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) stop $(SERVICE)
	@echo "$(GREEN)✅ $(SERVICE) pysäytetty!$(NC)"

# Käynnistä moduuli uudelleen
restart: ## Käynnistä moduuli uudelleen (käytä: make restart svc=backend)
	@echo "$(BLUE)🔄 Käynnistetään $(SERVICE) uudelleen...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) restart $(SERVICE)
	@echo "$(GREEN)✅ $(SERVICE) käynnistetty uudelleen!$(NC)"

# Migraatiot
migrate: ## Aja tietokanta migraatiot
	@echo "$(BLUE)🗄️ Ajetaan tietokanta migraatiot...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) run --rm migrate
	@echo "$(GREEN)✅ Migraatiot ajettu!$(NC)"

# Backup
backup: ## Luo tietokanta backup
	@echo "$(BLUE)💾 Luodaan tietokanta backup...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U converto -d converto > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup luotu!$(NC)"

# Restore
restore: ## Palauta tietokanta backupista (käytä: make restore file=backup.sql)
	@echo "$(BLUE)🔄 Palautetaan tietokanta backupista...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U converto -d converto < $(file)
	@echo "$(GREEN)✅ Tietokanta palautettu!$(NC)"

# Monitoring
monitor: ## Avaa monitoring dashboardit
	@echo "$(BLUE)📊 Avataan monitoring dashboardit...$(NC)"
	@echo "  📊 Prometheus: http://localhost:9090"
	@echo "  📈 Grafana:    http://localhost:3003"
	@echo ""
	@echo "$(YELLOW)Käynnistä selain automaattisesti? (y/N)$(NC)"
	@read -p "> " answer; \
	if [ "$$answer" = "y" ] || [ "$$answer" = "Y" ]; then \
		open http://localhost:9090; \
		open http://localhost:3003; \
	fi

# Lint
lint: ## Suorita lint-tarkistukset
	@echo "$(BLUE)🔍 Suoritetaan lint-tarkistukset...$(NC)"
	@echo "$(YELLOW)Frontend lint...$(NC)"
	@cd frontend && npm run lint
	@echo "$(YELLOW)Backend lint...$(NC)"
	@cd backend && python -m flake8 .
	@echo "$(GREEN)✅ Lint-tarkistukset valmiit!$(NC)"

# Test
test: ## Suorita testit
	@echo "$(BLUE)🧪 Suoritetaan testit...$(NC)"
	@echo "$(YELLOW)Backend testit...$(NC)"
	@cd backend && python -m pytest tests/ -v
	@echo "$(YELLOW)Frontend testit...$(NC)"
	@cd frontend && npm test
	@echo "$(GREEN)✅ Testit valmiit!$(NC)"

# Deploy
deploy: ## Deployaa tuotantoon
	@echo "$(BLUE)🚀 Deployataan tuotantoon...$(NC)"
	@make build
	@make test-smoke
	@make prod
	@echo "$(GREEN)✅ Deploy valmis!$(NC)"

# Oletuskomento
.DEFAULT_GOAL := help
