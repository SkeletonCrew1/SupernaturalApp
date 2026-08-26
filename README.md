# Supernatural

This repository contains secure social network application that consists of several microservices that run inside Docker containers and are orchestrated by Kubernetes and Helm. Our application features:

* Application is protected by a password
* New password is mailed daily to registered users
* Users have different tiers (copper, silver, gold)
* Users are able to log in with their email and password
* Users are assigned randomized aliases (no real names used)
* Reported or banned users are redirected to a different site
* Compromised button that deletes all data in our database
* User promotion is done by voting
* Inquisitor can vote to excommunicade a user
* New users can be invited via email (bypassing website password-protection)
* Some users can send email to masons of selected tier
* Architect and Architect hall of fame
* Architects can promote and demote any user without voting and are changed every 7 days
* Architect is chosen if majority of users vote YES(90%)

```text
.
├── auth                  # User authentication service
├── cleanup               # Cleanup service for erase database button
├── docs                  # Documentation folder
├── kubernetes             # Kubernetes manifests + Helm chart
├── frontend              # Web UI service for application
├── general               # General service:
│                             * Django application
│                             * Database
│                             * Database backups
└── mail_sending          # Mail sending service
```

## Prerequisites

* [Docker](https://docs.docker.com/desktop/) v29.6.2
* [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) v2.31.35
* [kubernetes](https://kubernetes.io/docs/tasks/tools/):
  1. Client v1.36.3
  1. Kustomize v5.8.1
  1. Server v.1.36.2
* [Helm](https://helm.sh/docs/intro/install/) v4.2.3
* Cloudflare API key with Zone edit permissions
* Your Domain with configured cloudflare name servers

## Steps to Run

1. Configure AWS credentials `aws config`
1. Deploy VPC, EKS, Consul and RDS from our other repo [SupernaturalIaC](https://github.com/CommandLine-5336/SupernaturalIaC)
1. Configure kubectl to work with your EKS cluster `aws eks update-kubeconfig --region <region-code> --name  <my-cluster>`
1. Add necessary addons like metrics server and cert-bot for certification
    ```bash
    helm install \
      cert-manager oci://quay.io/jetstack/charts/cert-manager \
      --version v1.21.1 \
      --namespace cert-manager \
      --create-namespace \
      --set crds.enabled=true
    helm upgrade --install cert-manager oci://quay.io/jetstack/charts/cert-manager --namespace cert-manager \
      --set config.gatewayAPI.enabled=true
    ```
    ```bash
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/high-availability-1.21+.yaml
    ```
1. Add neecessary values and secrets to kubernetes/supernatural_chart/Values.yaml
1. Run `helm install supernatural ./kubernetes/supernatural_chart/values.yaml`
1. Configure your domains DNS records to point at your NLB
1. To get TLS certification add your cloudflare api key:
    ```bash
    kubectl create secret generic cloudflare-api-token-secret \
    --from-literal=api-token=<YOUR_NEW_TOKEN> \
    -n cert-manager
    ```
1. Run `kubectl apply ./kubernetes/certification.yaml`
1. Go to your domain and enjoy!
