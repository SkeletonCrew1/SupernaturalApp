pipeline {
    agent any

    environment {
        PATH = "$PATH:/var/jenkins_home/.local/bin"
    }

    stages {

        stage("Install ArgoCD CLI") {
            steps{
                sh """
                    mkdir -p /var/jenkins_home/.local/bin
                    curl -sSL -o /var/jenkins_home/.local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
                    chmod +x /var/jenkins_home/.local/bin/argocd
                """
            }
        }

        stage("Login into ArgoCD"){
            steps {
                withCredentials([string(credentialsId: 'argocd-admin-password', variable: 'ARGOCD_PASSWORD')]) {
                    sh '''
                        echo "y" | argocd login argocd-server.argocd.svc.cluster.local --insecure --grpc-web --username admin --password "$ARGOCD_PASSWORD"
                    '''
                }
            }
        }

        stage("Deploy AWS Load Balancer Controller") {
            steps {
                sh '''
                    argocd app create aws-load-balancer-controller \
                    --repo https://aws.github.io/eks-charts \
                    --helm-chart aws-load-balancer-controller \
                    --revision 3.4.3 \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace kube-system \
                    --helm-set-string clusterName=eks-cluster \
                    --helm-set serviceAccount.create=true \
                    --helm-set-string serviceAccount.name=aws-load-balancer-controller \
                    --helm-set enableServiceMutatorWebhook=false \
                    --project default \
                    --upsert

                    argocd app sync aws-load-balancer-controller

                    argocd app wait aws-load-balancer-controller \
                    --sync \
                    --health \
                    --timeout 600
                '''
            }
        }
        stage("Deploy storage class for consul") {
            steps {
                sh '''
                    argocd app create consul-prerequisite \
                    --repo https://github.com/SkeletonCrew1/SupernaturalApp \
                    --path kubernetes/consul-prerequisite \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace consul \
                    --revision main \
                    --project default \
                    --upsert
                    argocd app sync consul-prerequisite
                '''
            }
        }
        stage("Deploy API CRD for consul") {
            steps {
                sh '''
                    argocd app create api-crd \
                    --repo https://github.com/kubernetes-sigs/ \
                    --path gateway-api/releases/download/v1.1.0/ \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace default \
                    --revision main \
                    --project default \
                    --upsert
                    argocd app sync api-crd
                '''
            }
        }
        stage("Cleanup Workspace"){
            steps {
                cleanWs()
            }
        }

    }
}
