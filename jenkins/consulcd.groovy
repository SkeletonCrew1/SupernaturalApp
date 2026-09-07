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
                    --helm-set enableCertManager=true \
                    --project default \
                    --upsert

                    argocd app sync aws-load-balancer-controller

                    argocd app wait aws-load-balancer-controller \
                    --resource apps:Deployment:aws-load-balancer-controller \
                    --health \
                    --timeout 300
                '''
            }
        }
        stage("Deploy storage class for consul") {
            steps {
                sh '''
                    argocd app create consul-prerequisite \
                    --repo https://github.com/SkeletonCrew1/SupernaturalApp \
                    --path kubernetes/consul-prerequisite/storage \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace consul \
                    --revision main \
                    --project default \
                    --upsert
                    argocd app sync consul-prerequisite
                    argocd app wait consul-prerequisite \
                    --sync \
                    --health \
                    --timeout 300
                '''
            }
        }
        stage("Checkout Repository") {
            steps {
                git branch: 'main',
                    url: 'https://github.com/SkeletonCrew1/SupernaturalApp'
            }
        }
        stage("Deploy consul chart") {
            steps {
                sh '''
                    argocd app create consul \
                    --repo https://helm.releases.hashicorp.com \
                    --helm-chart consul \
                    --revision 2.0.2 \
                    --values-literal-file kubernetes/consul/values.yaml \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace consul \
                    --sync-option CreateNamespace=true \
                    --sync-option ServerSideApply=true \
                    --project default \
                    --upsert
                    argocd app sync consul --prune
                    argocd app wait consul \
                    --health \
                    --timeout 900
                '''
            }
        }
        stage("Deploy API gateway and frontend route for consul") {
            steps {
                sh '''
                    argocd app create api-gateway-route \
                    --repo https://github.com/SkeletonCrew1/SupernaturalApp \
                    --path kubernetes/consul/templates/getaway \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace consul \
                    --revision main \
                    --project default \
                    --upsert
                    argocd app sync api-gateway-route
                    argocd app wait api-gateway-route \
                    --sync \
                    --health \
                    --timeout 300
                '''
            }
        }
        stage("Deploy intentions and serviceDefaults for consul") {
            steps {
                sh '''
                    argocd app create consul-intentions \
                    --repo https://github.com/SkeletonCrew1/SupernaturalApp \
                    --path kubernetes/consul/templates/intentions \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace consul \
                    --revision main \
                    --project default \
                    --upsert
                    argocd app sync consul-intentions
                    argocd app wait consul-intentions \
                    --sync \
                    --health \
                    --timeout 300
                '''
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
