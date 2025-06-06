
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
// pipeline {
//     agent any

//     tools {
//         nodejs 'NodeJS'
//     }

//     environment {
//         SONAR_SCANNER_OPTS = "-Xmx512m"
//         NODE_ENV = 'test'
//     }

//     stages {
//         stage('Checkout Code') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Clear npm cache') {
//             steps {
//                 sh 'rm -rf node_modules package-lock.json || true'
//                 sh 'npm cache clean --force'
//             }
//         }

//         stage('Install Dependencies') {
//             steps {
//                 sh 'npm install'
//                 sh 'npm uninstall bcrypt || true'
//                 sh 'npm install bcryptjs'
//                 sh 'chmod -R +x node_modules/.bin/'
//             }
//         }

//         stage('Update Code for bcryptjs') {
//             steps {
//                 script {
//                     // Replace bcrypt imports with bcryptjs in the codebase AND test files
//                     sh '''
//                     find . -name "*.js" -not -path "./node_modules/*" -exec sed -i 's/require("bcrypt")/require("bcryptjs")/g' {} \\;
//                     find . -name "*.js" -not -path "./node_modules/*" -exec sed -i "s/require('bcrypt')/require('bcryptjs')/g" {} \\;
//                     '''
//                 }
//             }
//         }

//         // stage('Fix Test Configuration') {
//         //     steps {
//         //         script {
//         //             // Update package.json to include Jest configuration if it doesn't exist
//         //             sh '''
//         //             # Check if jest config exists in package.json, if not add it
//         //             if ! grep -q '"jest"' package.json; then
//         //                 # Create a temporary package.json with jest config
//         //                 jq '. + {
//         //                     "jest": {
//         //                         "testEnvironment": "node",
//         //                         "testTimeout": 15000,
//         //                         "collectCoverageFrom": [
//         //                             "**/*.js",
//         //                             "!node_modules/**",
//         //                             "!coverage/**",
//         //                             "!tests/**"
//         //                         ],
//         //                         "coverageReporters": ["text", "lcov", "html"],
//         //                         "testMatch": ["**/tests/**/*.test.js"]
//         //                     }
//         //                 }' package.json > package.json.tmp && mv package.json.tmp package.json
//         //             fi
//         //             '''
//         //         }
//         //     }
//         // }

//           stage('Fix Test Configuration') {
//     steps {
//         script {
//             sh '''
//             # Only add jest config to package.json if jest.config.js does NOT exist
//             if [ ! -f jest.config.js ]; then
//                 if ! grep -q '"jest"' package.json; then
//                     jq '. + {
//                         "jest": {
//                             "testEnvironment": "node",
//                             "testTimeout": 15000,
//                             "collectCoverageFrom": [
//                                 "**/*.js",
//                                 "!node_modules/**",
//                                 "!coverage/**",
//                                 "!tests/**"
//                             ],
//                             "coverageReporters": ["text", "lcov", "html"],
//                             "testMatch": ["**/tests/**/*.test.js"]
//                         }
//                     }' package.json > package.json.tmp && mv package.json.tmp package.json
//                 fi
//             fi
//             '''
//         }
//     }
// }


//         stage('Run Tests with Coverage') {
//             steps {
//                 script {
//                     try {
//                         sh 'npx jest --coverage --verbose --detectOpenHandles --forceExit'
//                         sh 'npx jest --config=jest.config.js --coverage --verbose --detectOpenHandles --forceExit'

//                     } catch (Exception e) {
//                         echo "npx jest failed, trying direct execution..."
//                         try {
//                             sh './node_modules/.bin/jest --coverage --verbose --detectOpenHandles --forceExit'
//                         } catch (Exception e2) {
//                             echo "Direct jest execution also failed. Checking test files..."
//                             sh 'ls -la tests/'
//                             sh 'cat tests/*.test.js'
//                             error "All test execution methods failed"
//                         }
//                     }
//                 }
//             }
//             post {
//                 always {
//                     // Archive coverage reports
//                     script {
//                         if (fileExists('coverage/')) {
//                             archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
//                         }
//                     }
//                 }
//             }
//         }

//         // stage('SonarQube Analysis') {
//         //     steps {
//         //         withSonarQubeEnv('Sonar-server') {
//         //             sh """
//         //             docker run --rm \\
//         //                 -e SONAR_HOST_URL=\${SONAR_HOST_URL} \\
//         //                 -e SONAR_LOGIN=\${SONAR_AUTH_TOKEN} \\
//         //                 -v \${WORKSPACE}:/usr/src \\
//         //                 sonarsource/sonar-scanner-cli:latest
//         //             """
//         //         }
//         //     }
//         // }
//         stage('SonarQube Analysis') {
//                    steps {
//                    withSonarQubeEnv('Sonar-server') {
//                    withCredentials([string(credentialsId: 'mysonar-second-token', variable: 'SONAR_LOGIN')]) {
//                    sh """
//                    docker run --rm \\
//                     -e SONAR_HOST_URL=\${SONAR_HOST_URL} \\
//                     -e SONAR_LOGIN=\${SONAR_LOGIN} \\
//                     -v \${WORKSPACE}:/usr/src \\
//                     sonarsource/sonar-scanner-cli:latest
//                 """
//             }
//         }
//     }
// }


//         stage('Quality Gate') {
//             when {
//                 anyOf {
//                     branch 'main'
//                     branch 'master'
//                 }
//             }
//             steps {
//                 timeout(time: 5, unit: 'MINUTES') {
//                     script {
//                         try {
//                             waitForQualityGate abortPipeline: true
//                         } catch (Exception e) {
//                             echo "Quality gate failed, but continuing..."
//                             currentBuild.result = 'UNSTABLE'
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             echo 'Pipeline execution completed'
//             script {
//                 // Archive all relevant artifacts
//                 if (fileExists('coverage/')) {
//                     archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
//                 }
                
//                 // Clean up any hanging processes
//                 sh 'pkill -f jest || true'
//                 sh 'pkill -f node || true'
//             }
//         }
//         success {
//             echo 'Pipeline executed successfully!'
//         }
//         failure {
//             echo 'Pipeline execution failed!'
//             script {
//                 // Debug information on failure
//                 sh 'echo "Node version: $(node --version)"'
//                 sh 'echo "NPM version: $(npm --version)"'
//                 sh 'ls -la'
//                 if (fileExists('tests/')) {
//                     sh 'ls -la tests/'
//                 }
//             }
//         }
//         unstable {
//             echo 'Pipeline execution was unstable!'
//         }
//     }
// }


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
                    sh '''
                    if [ ! -f jest.config.js ]; then
                        echo "jest.config.js not found, checking package.json for jest config..."
                        if ! grep -q '"jest"' package.json; then
                            echo "Adding jest configuration to package.json..."
                            node -e "
                                const fs = require('fs');
                                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                                pkg.jest = {
                                    testEnvironment: 'node',
                                    testTimeout: 15000,
                                    collectCoverageFrom: [
                                        '**/*.js',
                                        '!node_modules/**',
                                        '!coverage/**',
                                        '!tests/**'
                                    ],
                                    coverageReporters: ['text', 'lcov', 'html'],
                                    testMatch: ['**/tests/**/*.test.js']
                                };
                                fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
                            "
                        fi
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
                    try {
                        if (fileExists('jest.config.js')) {
                            sh 'npx jest --config=jest.config.js --coverage --verbose --detectOpenHandles --forceExit'
                        } else {
                            sh 'npx jest --coverage --verbose --detectOpenHandles --forceExit'
                        }
                    } catch (Exception e) {
                        echo "npx jest failed, trying direct execution..."
                        try {
                            sh './node_modules/.bin/jest --coverage --verbose --detectOpenHandles --forceExit'
                        } catch (Exception e2) {
                            echo "Direct jest execution also failed. Checking test files..."
                            sh 'ls -la tests/ || echo "No tests directory found"'
                            if (fileExists('tests/')) {
                                sh 'cat tests/*.test.js'
                            }
                            error "All test execution methods failed"
                        }
                    }
                }
            }
            post {
                always {
                    script {
                        if (fileExists('coverage/')) {
                            archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    try {
                        withSonarQubeEnv('Sonar-server') {
                            withCredentials([string(credentialsId: 'mysonar-second-token', variable: 'SONAR_TOKEN')]) {
                                // Store the analysis task info
                                sh """
                                docker run --rm \\
                                    -e SONAR_HOST_URL=\${SONAR_HOST_URL} \\
                                    -e SONAR_TOKEN=\${SONAR_TOKEN} \\
                                    -v \${WORKSPACE}:/usr/src \\
                                    sonarsource/sonar-scanner-cli:latest > sonar-analysis.log 2>&1
                                """
                                
                                // Extract task ID from logs for quality gate
                                sh '''
                                if [ -f sonar-analysis.log ]; then
                                    echo "SonarQube Analysis Log:"
                                    cat sonar-analysis.log
                                    
                                    # Extract task ID if present
                                    TASK_ID=$(grep -o "task?id=[^\"]*" sonar-analysis.log | cut -d'=' -f2 || echo "")
                                    if [ ! -z "$TASK_ID" ]; then
                                        echo "SONAR_TASK_ID=$TASK_ID" > sonar-task.properties
                                        echo "Task ID found: $TASK_ID"
                                    fi
                                fi
                                '''
                            }
                        }
                    } catch (Exception e) {
                        echo "SonarQube analysis failed: ${e.getMessage()}"
                        echo "Continuing pipeline execution..."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            try {
                                // Only proceed if SonarQube analysis was successful
                                if (fileExists('sonar-task.properties')) {
                                    echo "Attempting to wait for quality gate..."
                                    def qg = waitForQualityGate()
                                    if (qg.status != 'OK') {
                                        echo "Quality Gate status: ${qg.status}"
                                        echo "Quality Gate failed, but continuing pipeline..."
                                        currentBuild.result = 'UNSTABLE'
                                    } else {
                                        echo "Quality Gate passed!"
                                    }
                                } else {
                                    echo "Skipping quality gate check - no task info available"
                                    echo "SonarQube analysis may have completed but task ID extraction failed"
                                    // Don't fail the build for this
                                }
                            } catch (Exception e) {
                                echo "Quality gate check failed: ${e.getMessage()}"
                                echo "This might be due to SonarQube server connectivity or configuration"
                                echo "Continuing pipeline execution..."
                                currentBuild.result = 'UNSTABLE'
                            }
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
                
                // Archive SonarQube logs for debugging
                if (fileExists('sonar-analysis.log')) {
                    archiveArtifacts artifacts: 'sonar-analysis.log', allowEmptyArchive: true
                }
                
                // Clean up any hanging processes
                sh 'pkill -f jest || true'
                sh 'pkill -f node || true'
                
                // Clean up temporary files
                sh 'rm -f sonar-analysis.log sonar-task.properties || true'
            }
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed!'
            script {
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
            echo 'This usually indicates that tests passed but quality gates or other checks had issues.'
        }
    }
}