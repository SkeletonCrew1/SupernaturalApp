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

        stage("Create clusterissuer+certificate for https"){
            steps{
                sh '''
                    argocd app create https \
                    --repo https://github.com/SkeletonCrew1/SupernaturalApp \
                    --path kubernetes/https \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace consul \
                    --sync-option CreateNamespace=true \
                    --revision main \
                    --project default \
                    --upsert
                '''
            }
        }
        stage("Synchronize clusterissuer"){
            steps{
                sh '''
                    argocd app sync https
                    argocd app wait https \
                    --sync \
                    --health \
                    --timeout 600
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
