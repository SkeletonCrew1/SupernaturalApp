# HTTPS
This folder contains resources necessary for configuring TLS and HTTPS in our app.

## How to get a certificate
1. Generate Cloudflare API token with DNS edit permissions and store it as a `cloudflare-api-token-secret` opaque secret in cert-manager namespace as
`api-token=value`.
1. Connect to EKS cluster
1. Apply [certification.yaml](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/kubernetes/https/certification.yaml)

1. Change [certificate.yaml](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/kubernetes/https/certificate.yaml)
according to your domain and namespace
1. Be happy when certificate becomes ready
