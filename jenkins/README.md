# What is?
This folder is for storing our Jenkins CD pipelines. Currently only one pipeline is available:
* cd.groovy is a CD pipeline to deploy or update our masonic application, ingress and  to our EKS cluster.

## How to run?
1. Expose Jenkins server using `kubectl --namespace jenkins port-forward svc/jenkins 8080:8080`.
2. Log into Jenkins.
3. Go to settings, add a security credential with type of secret text, called `argocd-admin-password` with actual ArgoCD password (get it from AWS Secrets Manager).
4. Create a new job of pipeline type and add code from `jenkins/cd.groovy`.
5. Run the job and wait for 2-3 minutes until Load Balancer is fully provisioned.
