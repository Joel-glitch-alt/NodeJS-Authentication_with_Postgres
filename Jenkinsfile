pipeline {
    agent any

    tools {
        jdk 'Java-17'  // This must match exactly what you named it in Jenkins UI
    }

    environment {
        JAVA_HOME = tool name: 'Java-17', type: 'jdk'
        PATH = "${JAVA_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Hello') {
            steps {
                echo 'Hello World'
                sh 'java -version'
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
                withSonarQubeEnv(installationName: 'Sonar-server', credentialsId: 'mysonar-token') {
                    sh 'java -version'        // Confirm Java version used
                    sh 'sonar-scanner'        // Run scanner
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building...'
                // Example: sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                // Example: sh 'npm test'
            }
        }
    }
}
