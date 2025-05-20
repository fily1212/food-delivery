#!/bin/bash

# Lista dei servizi
SERVICES=("order-service" "kitchen-service" "accounting-service" "restaurant-service")

# Crea le cartelle se non esistono
mkdir -p k8s/deployment
mkdir -p k8s/service

# Loop sui servizi per creare file vuoti
for SERVICE in "${SERVICES[@]}"; do
  touch "k8s/deployment/${SERVICE}-deployment.yml"
  touch "k8s/service/${SERVICE}-service.yml"
  echo "Creati file vuoti per ${SERVICE}"
done
