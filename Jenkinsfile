
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

        stage('Clear npm cache') {
            steps {
                sh 'npm cache clean --force'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                // Fix permissions for node_modules binaries
                sh 'chmod -R +x node_modules/.bin/'
            }
        }

        stage('Run Tests with Coverage') {
            steps {
                script {
                    try {
                        // Try using npx first (recommended approach)
                        sh 'npx jest --coverage'
                    } catch (Exception e) {
                        echo "npx failed, trying direct execution..."
                        // Fallback to direct execution
                        sh './node_modules/.bin/jest --coverage'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonar-server') {
                    sh """
                    docker run --rm \\
                        -e SONAR_HOST_URL=\${SONAR_HOST_URL} \\
                        -e SONAR_LOGIN=\${SONAR_AUTH_TOKEN} \\
                        -v \${WORKSPACE}:/usr/src \\
                        sonarsource/sonar-scanner-cli:latest
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed'
            // Archive test results if they exist
            script {
                if (fileExists('coverage/')) {
                    archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                }
            }
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed!'
        }
    }
}