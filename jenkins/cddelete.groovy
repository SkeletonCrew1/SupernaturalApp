pipeline {
    agent any

    environment {
        PATH = "$PATH:/var/jenkins_home/.local/bin"
    }

    stages {

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
                    argocd app delete supernatural
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
