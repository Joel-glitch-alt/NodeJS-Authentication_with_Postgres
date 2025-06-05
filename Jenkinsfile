
// This Pipeline does not work becos of version incompatibility issues with the SonarQube plugin.
// pipeline {
//     agent any

//     stages {
//         stage('Checkout Code') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('SonarQube Analysis') {
//             steps {
//                 withSonarQubeEnv('Sonar-server') {
//                     sh 'sonar-scanner'
//                 }
//             }
//         }

//         stage('Build') {
//             steps {
//                 echo 'Building...'
//                 // Your build commands here
//             }
//         }

//         stage('Test') {
//             steps {
//                 echo 'Testing...'
//                 // Your test commands here
//             }
//         }
//     }
// }


////////////////////////
pipeline {
    agent any

    tools {
        nodejs 'NodeJS'  // Use the NodeJS tool installed on Jenkins
    }

    environment {
        SONAR_SCANNER_OPTS = "-Xmx512m"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        //
        stage('Clear npm cache') {
    steps {
        sh 'npm cache clean --force'
    }
}

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests with Coverage') {
            steps {
                sh 'npm run test:coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonar-server') {
                    sh """
                    docker run --rm \\
                        -e SONAR_HOST_URL=${SONAR_HOST_URL} \\
                        -e SONAR_LOGIN=${SONAR_AUTH_TOKEN} \\
                        -v ${WORKSPACE}:/usr/src \\
                        sonarsource/sonar-scanner-cli:latest
                    """
                }
            }
        }
    }
}