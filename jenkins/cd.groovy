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

        stage("Create application inside ArgoCD if does not exist already"){
            steps{
                sh '''
                    argocd app create supernatural \
                    --repo https://github.com/SkeletonCrew1/SupernaturalApp \
                    --path kubernetes/supernatural_chart \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace app \
                    --sync-option CreateNamespace=true \
                    --revision main \
                    --values values.yaml \
                    --project default \
                    --upsert
                '''
            }
        }

        stage("Synchronize Supernatural Application"){
            steps{
                sh "argocd app sync supernatural"
            }
        }

        stage("Cleanup Workspace"){
            steps {
                cleanWs()
            }
        }

    }
}
