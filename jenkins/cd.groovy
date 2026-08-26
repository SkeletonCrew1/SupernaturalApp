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
                    argocd app create masonic \
                    --repo https://github.com/SkeletonCrew1/MasonicApp.git \
                    --path k8s/masonic-chart/masonic \
                    --dest-server https://kubernetes.default.svc \
                    --dest-namespace application \
                    --revision main \
                    --values values-stage.yaml \
                    --project default \
                    --upsert
                '''
            }
        }

        stage("Synchronize Masonic Application"){
            steps{
                sh "argocd app sync masonic"
            }
        }

        stage("Cleanup Workspace"){
            steps {
                cleanWs()
            }
        }

    }
}