# Consul service mesh

## Description
Consul service mesh, that allows different containers to securely communicate with each other, using gossip encryption key, and sends all traffic received on AWS nlb to frontend container.

## Steps to set up consul service mesh
- Change location to consul directory
  - `cd .\consul\`

- Set kubectl to our cluster
  - `aws eks --region us-east-1 update-kubeconfig --name supernatural-eks-cluster`
  - `kubectl get nodes`          #check whether 3 nodes are active

- Install helm repositories
  - `helm repo add hashicorp https://helm.releases.hashicorp.com`   #consul helm chart
  - `helm repo add eks https://aws.github.io/eks-charts`            #aws eks helm chart
  - `helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver` #aws ebs helm chart
  - `helm repo update`

- Create load balancer controller
  - `helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=eks-cluster --set serviceAccount.create=true --set serviceAccount.name=aws-load-balancer-controller --set enableServiceMutatorWebhook=false` #installation of lb controller pod that automatically creates aws nlb
  - `kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller -w` #check if pod is Ready (1/1)

- Add EBS driver for storage class
  - `helm install aws-ebs-csi-driver aws-ebs-csi-driver/aws-ebs-csi-driver --namespace kube-system`

- Create namespaces and storage class
  - `kubectl apply -f .\templates\namespaces\consul_namespace.yaml`
  - `kubectl apply -f .\templates\namespaces\app_namespace.yaml`
  - `kubectl apply -f .\templates\storage\storageclasss.yaml`

- Install gateway API CRD (Custom Resource Definitions): gateway, gatewayclass, HTTProute
  - `kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.1.0/experimental-install.yaml`

- Store gossip secret key
  - `openssl rand -base64 32` #generate the key
  - `kubectl create secret generic consul-gossip-encryption-key -n consul --from-literal=key="<generated key>"` #store it

- Install consul service mesh
  - `helm install consul hashicorp/consul --namespace consul --version 2.0.2-oss -f values.yaml` #installs and sets up consul service mesh with settings from values.yaml
  - `kubectl get pods -n consul -w`      # check if all pods are Running and Ready (1/1)
  - `kubectl get pvc -n consul`          # check if all 3 are bound

- Set up API gateaway, frontend route and a TLS certificate
  - `kubectl apply -f .\templates\getaway\api-gateaway.yaml`
  - `kubectl apply -f .\templates\getaway\frontend-route.yaml`
  - `kubectl apply -f .\templates\getaway\certificate.yaml` # beware that you have to change dnsnames to your domain name
  - `kubectl get gateway -n consul -w` # check if Programmed is true
  - `kubectl get svc -n consul -l component=api-gateway`   # check if nlb hostname is listed

  If previous two steps do not have the expected outcome:
  - `kubectl delete lease consul-controller-lock -n consul` #delete stale lead controller
  - `kubectl rollout restart deployment consul-connect-injector -n consul` #restart the injector, so that controller is recreated and it sees new gateway

  Run check commands again.

- Apply intentions
  - `kubectl apply -f .\templates\intentions\auth-intentions.yaml`
  - `kubectl apply -f .\templates\intentions\cleanup-intentions.yaml`
  - `kubectl apply -f .\templates\intentions\frontend-intentions.yaml`
  - `kubectl apply -f .\templates\intentions\general-intentions.yaml`
  - `kubectl apply -f .\templates\intentions\mail_service-intentions.yaml`

- Verify if everything works correctly
  - `kubectl exec -it consul-server-0 -n consul -- consul members` #check if all consul servers are alive
  - `kubectl get gateway -n consul` #check if our api-gateway is listed
  - `kubectl get svc -n consul -l component=api-gateway` #get AWS nlb ip and url for testing
