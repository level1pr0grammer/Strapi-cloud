PROJECT_ID=cloud-project-448820
REGION=asia-southeast1
CLUSTER=autopilot-strapi
SERVICE_ACCOUNT=cloud-sql-proxy@$(PROJECT_ID).iam.gserviceaccount.com

# Cloud SQL Instance
DB_INSTANCE=postgresql

# Kubernetes Deployment and Namespace
DEPLOYMENT=strapi-deploy
NAMESPACE=strapi

HPA=strapi-hpa
VPA=strapi-vpa
# =====================
# STOP SERVER
# =====================
stop: stop-postgres delete-strapi

stop-postgres:
	@echo "Stopping PostgreSQL instance..."
	gcloud sql instances patch $(DB_INSTANCE) --activation-policy NEVER --project=$(PROJECT_ID) --quiet

delete-strapi:
	@echo "Deleting Strapi workload..."
	gcloud container clusters get-credentials $(CLUSTER) --region $(REGION) --project $(PROJECT_ID)
	kubectl delete hpa $(HPA) -n $(NAMESPACE) || true
	kubectl delete vpa $(VPA) -n $(NAMESPACE) || true
	kubectl delete deployment $(DEPLOYMENT) -n $(NAMESPACE) || true
	@echo "Strapi workload deleted."

# =====================
# START SERVER
# =====================
start: start-postgres apply-deployment

start-postgres:
	@echo "Starting PostgreSQL instance..."
	gcloud sql instances patch $(DB_INSTANCE) --activation-policy ALWAYS --project=$(PROJECT_ID) --quiet

apply-deployment:
	@echo "Applying deployment.yaml..."
	gcloud container clusters get-credentials $(CLUSTER) --region $(REGION) --project $(PROJECT_ID)
	kubectl apply -f deployment.yaml
	kubectl apply -f HPA.yaml
	kubectl apply -f VPA.yaml
	kubectl patch service strapi-deploy-service -n $(NAMESPACE) --type json -p '[{"op": "replace", "path": "/spec/selector", "value": {"app": "strapi"}}]'
	@echo "Deployment applied successfully."
