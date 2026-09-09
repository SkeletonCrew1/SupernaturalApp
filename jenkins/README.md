# What is?
This folder is for storing our Jenkins CD pipelines. Pipelines in this folder are:
1. [cd.groovy](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/jenkins/cd.groovy) is a CD pipeline to deploy or update our Supernatural applicationto our EKS cluster.
1. [cddelete.groovy](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/jenkins/cddelete.groovy) is a pipeline for tearing down
the application
1. [consulcd.groovy](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/jenkins/consulcd.groovy) is a pipeline for deploying and configuring
consul service mesh
1. [httpscd.groovy](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/jenkins/httpscd.groovy) is a pipeline that configures ClusterIssuer and a certificate for consul NLB

## How to run?
1. Deploy EKS cluster and connect to it.
1. Expose Jenkins server using `kubectl --namespace jenkins port-forward svc/jenkins 8080:8080`.
1. Log into Jenkins.
1. Go to settings, add a security credential with type of secret text, called `argocd-admin-password` with actual ArgoCD password (get it from AWS Secrets Manager).
1. Create a 4 pipelines from `*.groovy` files.
1. Run jobs in following order:
    1. [httpscd.groovy](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/jenkins/httpscd.groovy)
    1. [consulcd.groovy](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/jenkins/consulcd.groovy)
    1. [cd.groovy](https://github.com/SkeletonCrew1/SupernaturalApp/blob/main/jenkins/cd.groovy)
