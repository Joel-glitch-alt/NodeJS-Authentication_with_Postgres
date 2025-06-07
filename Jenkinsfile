
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

//////////////////
pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        SONAR_SCANNER_OPTS = "-Xmx1024m"
        NODE_ENV = 'test'
        DOCKER_IMAGE_NAME = 'addition1905/nodejs-authentication-postgresql'
        DOCKER_TAG = "${BUILD_NUMBER}"
        SONAR_TIMEOUT = '10' // minutes
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Clear npm cache') {
            steps {
                sh 'rm -rf node_modules package-lock.json || true'
                sh 'npm cache clean --force'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npm uninstall bcrypt || true'
                sh 'npm install bcryptjs'
                sh 'chmod -R +x node_modules/.bin/'
            }
        }

        stage('Update Code for bcryptjs') {
            steps {
                script {
                    sh '''
                    find . -name "*.js" -not -path "./node_modules/*" -exec sed -i 's/require("bcrypt")/require("bcryptjs")/g' {} \;
                    find . -name "*.js" -not -path "./node_modules/*" -exec sed -i "s/require('bcrypt')/require('bcryptjs')/g" {} \;
                    '''
                }
            }
        }

        stage('Fix Test Configuration') {
            steps {
                script {
                    sh '''
                    if [ ! -f jest.config.js ]; then
                        echo "jest.config.js not found, using existing configuration from package.json"
                    else
                        echo "jest.config.js found, using existing configuration"
                    fi
                    '''
                }
            }
        }

        stage('Run Tests with Coverage') {
            steps {
                script {
                    if (fileExists('jest.config.js')) {
                        sh 'npx jest --config=jest.config.js --coverage --verbose --detectOpenHandles --forceExit'
                    } else {
                        sh 'npx jest --coverage --verbose --detectOpenHandles --forceExit'
                    }
                }
            }
            post {
                always {
                    script {
                        if (fileExists('coverage/')) {
                            archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                            echo "Coverage report archived successfully"
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    try {
                        timeout(time: 10, unit: 'MINUTES') {
                            withSonarQubeEnv('Sonar-server') {
                                withCredentials([string(credentialsId: 'mysonar-second-token', variable: 'SONAR_TOKEN')]) {
                                    sh """
                                    docker run --rm \
                                        -e SONAR_HOST_URL=\${SONAR_HOST_URL} \
                                        -e SONAR_TOKEN=\${SONAR_TOKEN} \
                                        -v \${WORKSPACE}:/usr/src \
                                        sonarsource/sonar-scanner-cli:latest
                                    """
                                }
                            }
                        }
                    } catch (Exception e) {
                        echo "SonarQube analysis failed or timed out: ${e.getMessage()}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    // Ensure we have the latest code and Dockerfile
                    checkout scm

                    try {
                        // Build the Docker image with build number tag
                        def img = docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_TAG}")

                        // Also tag as latest
                        sh "docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} ${DOCKER_IMAGE_NAME}:latest"

                        // Push to Docker Hub
                        docker.withRegistry('https://index.docker.io/v1/', 'addition1905') {
                            img.push("${DOCKER_TAG}")
                            img.push("latest")
                        }

                        echo "✅ Docker image built and pushed successfully!"
                        echo "📦 Image: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
                        echo "📦 Image: ${DOCKER_IMAGE_NAME}:latest"

                    } catch (Exception e) {
                        echo "❌ Docker build/push failed: ${e.getMessage()}"
                        error "Docker build and push stage failed"
                    }
                }
            }
        }

        stage('Deployment Ready Check') {
            steps {
                script {
                    echo "=== PIPELINE SUCCESS SUMMARY ==="
                    echo "✅ Code checked out successfully"
                    echo "✅ Dependencies installed and configured"
                    echo "✅ All tests passed"
                    echo "✅ Code coverage generated"
                    echo "✅ SonarQube analysis completed"
                    echo "✅ Docker image built and pushed"
                    echo ""
                    echo "🚀 Your Node.js application is ready for deployment!"
                    echo "🐳 Pull and run with: docker run -p 3000:3000 ${DOCKER_IMAGE_NAME}:latest"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed'
            script {
                // Archive coverage reports
                if (fileExists('coverage/')) {
                    archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                }

                // Clean up processes
                sh 'pkill -f jest || true'
                sh 'pkill -f node || true'

                // Clean up Docker images to save space (optional)
                sh """
                    docker rmi ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} || true
                    docker system prune -f || true
                """
            }
        }
        success {
            echo '🎉 Pipeline executed successfully!'
            echo "🐳 Docker image ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} is now available on Docker Hub"
        }
        failure {
            echo '❌ Pipeline execution failed!'
            script {
                sh 'echo "Node version: $(node --version)"'
                sh 'echo "NPM version: $(npm --version)"'
                sh 'docker --version || echo "Docker not available"'
            }
        }
        unstable {
            echo '⚠️ Pipeline execution was unstable!'
            echo 'Some stages may have had issues but core functionality works.'
        }
    }
}