
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
        nodejs 'NodeJS'
    }

    environment {
        SONAR_SCANNER_OPTS = "-Xmx512m"
        NODE_ENV = 'test'
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
                    // Replace bcrypt imports with bcryptjs in the codebase AND test files
                    sh '''
                    find . -name "*.js" -not -path "./node_modules/*" -exec sed -i 's/require("bcrypt")/require("bcryptjs")/g' {} \\;
                    find . -name "*.js" -not -path "./node_modules/*" -exec sed -i "s/require('bcrypt')/require('bcryptjs')/g" {} \\;
                    '''
                }
            }
        }

        stage('Fix Test Configuration') {
            steps {
                script {
                    // Update package.json to include Jest configuration if it doesn't exist
                    sh '''
                    # Check if jest config exists in package.json, if not add it
                    if ! grep -q '"jest"' package.json; then
                        # Create a temporary package.json with jest config
                        jq '. + {
                            "jest": {
                                "testEnvironment": "node",
                                "testTimeout": 15000,
                                "collectCoverageFrom": [
                                    "**/*.js",
                                    "!node_modules/**",
                                    "!coverage/**",
                                    "!tests/**"
                                ],
                                "coverageReporters": ["text", "lcov", "html"],
                                "testMatch": ["**/tests/**/*.test.js"]
                            }
                        }' package.json > package.json.tmp && mv package.json.tmp package.json
                    fi
                    '''
                }
            }
        }

        stage('Run Tests with Coverage') {
            steps {
                script {
                    try {
                        sh 'npx jest --coverage --verbose --detectOpenHandles --forceExit'
                    } catch (Exception e) {
                        echo "npx jest failed, trying direct execution..."
                        try {
                            sh './node_modules/.bin/jest --coverage --verbose --detectOpenHandles --forceExit'
                        } catch (Exception e2) {
                            echo "Direct jest execution also failed. Checking test files..."
                            sh 'ls -la tests/'
                            sh 'cat tests/*.test.js'
                            error "All test execution methods failed"
                        }
                    }
                }
            }
            post {
                always {
                    // Archive coverage reports
                    script {
                        if (fileExists('coverage/')) {
                            archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                // Only run SonarQube on main branch to avoid issues with PR builds
                anyOf {
                    branch 'main'
                    //branch 'master'
                }
            }
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

        stage('Quality Gate') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        try {
                            waitForQualityGate abortPipeline: true
                        } catch (Exception e) {
                            echo "Quality gate failed, but continuing..."
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed'
            script {
                // Archive all relevant artifacts
                if (fileExists('coverage/')) {
                    archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                }
                
                // Clean up any hanging processes
                sh 'pkill -f jest || true'
                sh 'pkill -f node || true'
            }
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed!'
            script {
                // Debug information on failure
                sh 'echo "Node version: $(node --version)"'
                sh 'echo "NPM version: $(npm --version)"'
                sh 'ls -la'
                if (fileExists('tests/')) {
                    sh 'ls -la tests/'
                }
            }
        }
        unstable {
            echo 'Pipeline execution was unstable!'
        }
    }
}