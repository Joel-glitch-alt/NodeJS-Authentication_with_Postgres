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
                withSonarQubeEnv(credentialsId: 'Sonar-server') {
                    sh 'sonar-scanner'
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
