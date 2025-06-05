// pipeline {
//     agent any

//     stages {
       
//         stage('Checkout Code') {
//             steps {
//                 echo 'Cloning Git repository'
//                 checkout scm
//             }
//         }

//         stage('SonarQube Analysis') {
//             steps {
//                 withSonarQubeEnv(installationName: 'Sonar-server', credentialsId: 'mysonar-second-token') {
//                     sh '''
//                         docker run --rm \
//                             -e SONAR_HOST_URL="${SONAR_HOST_URL}" \
//                             -e SONAR_TOKEN="${SONAR_AUTH_TOKEN}" \
//                             -v "${WORKSPACE}:/usr/src" \
//                             sonarsource/sonar-scanner-cli:latest
//                     '''
//                 }
//             }
//         }

//         stage('Build') {
//             steps {
//                 echo 'Building...'
//                 // Example: sh 'npm install' or 'make build'
//             }
//         }

//         stage('Test') {
//             steps {
//                 echo 'Testing...'
//                 // Example: sh 'npm test' or 'make test'
//             }
//         }
//     }
// }

pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonar-server') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building...'
                // Your build commands here
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                // Your test commands here
            }
        }
    }
}
