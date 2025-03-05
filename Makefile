PROJECT_ID=cloud-project-448820
REGION=asia-southeast1
CLUSTER=autopilot-strapi
SERVICE_ACCOUNT=cloud-sql-proxy@$(PROJECT_ID).iam.gserviceaccount.com

# Cloud SQL Instance
DB_INSTANCE=postgresql

# Cloud Build Trigger Name
BUILD_TRIGGER=strapi--build

# Kubernetes Deployment and Namespace
DEPLOYMENT=strapi-deploy
NAMESPACE=strapi

# =====================
# STOP SERVER
# =====================
stop: stop-postgres disable-build delete-strapi

stop-postgres:
	@echo "Stopping PostgreSQL instance..."
	gcloud sql instances patch $(DB_INSTANCE) --activation-policy NEVER --project=$(PROJECT_ID) --quiet

disable-build:
	@echo "Disabling Cloud Build trigger..."
	gcloud beta builds triggers update $(BUILD_TRIGGER) --disable --project=$(PROJECT_ID)

delete-strapi:
	@echo "Deleting Strapi workload..."
	gcloud container clusters get-credentials $(CLUSTER) --region $(REGION) --project $(PROJECT_ID)
	kubectl delete deployment $(DEPLOYMENT) -n $(NAMESPACE) || true
	@echo "Strapi workload deleted."

# =====================
# START SERVER
# =====================
start: start-postgres enable-build apply-deployment

start-postgres:
	@echo "Starting PostgreSQL instance..."
	gcloud sql instances patch $(DB_INSTANCE) --activation-policy ALWAYS --project=$(PROJECT_ID) --quiet

enable-build:
	@echo "Enabling Cloud Build trigger..."
	gcloud builds triggers update 8719b850-857f-43c4-ba60-ccc2a253f43e --no-disabled --project=$(PROJECT_ID)

apply-deployment:
	@echo "Applying deployment.yaml..."
	gcloud container clusters get-credentials $(CLUSTER) --region $(REGION) --project $(PROJECT_ID)
	kubectl apply -f deployment.yaml -n $(NAMESPACE)
	kubectl patch service strapi-deploy-service -n $(NAMESPACE) --type json -p '[{"op": "replace", "path": "/spec/selector", "value": {"app": "strapi"}}]'
	@echo "Deployment applied successfully."
