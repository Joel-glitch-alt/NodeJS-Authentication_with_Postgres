pipeline {
    agent any

    stages {
        stage('Hello') {
            steps {
                echo 'Hello World'
            }
        }

        stage('Checkout Code') {
            steps {
                echo 'Cloning Git repository'
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv(installationName: 'Sonar-server', credentialsId: 'mysonar-second-token') {
                    sh '''
                        docker run --rm \
                            -e SONAR_HOST_URL="${SONAR_HOST_URL}" \
                            -e SONAR_TOKEN="${SONAR_AUTH_TOKEN}" \
                            -v "${WORKSPACE}:/usr/src" \
                            sonarsource/sonar-scanner-cli:latest
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building...'
                // Example: sh 'npm install' or 'make build'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                // Example: sh 'npm test' or 'make test'
            }
        }
    }
}