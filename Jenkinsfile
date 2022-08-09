#!/usr/bin/env groovy
def deploymentStages = [:]

/*
 * This function reads the list of features and sends
   that list to funciton "assignFeatureToMachine"
 */
def getFeaturesGroupsToRun() {
    def numMachines = "${CONTAINERS}".toInteger()
    def list = sh(script: "find cypress/e2e/**/*cy.js -name '*cy.js' -print0 | xargs -0 | tr  ' ' ,", returnStdout: true)
    def map = assignFeatureToMachine(numMachines, list)

    print 'Number of containers: ' + numMachines
    map.each { key, value -> 
        print 'Size: ' + value.size() + ' '   + key + ' ' + value
    }
    return map
}

/*
 * This function gets the list of features and assign each one
   to a machine to be executed
 */
def assignFeatureToMachine(numMachines, list) {
    def map = [:]
    def round = 0
    def nameAndValue = list.split(',')
    print 'Number of tests files ' + nameAndValue.size()

    nameAndValue.eachWithIndex { val, idx ->
        round = (idx / numMachines).toInteger()
        if (idx < numMachines) {
            map['machine' + idx] = []
            map['machine' + idx].add(val)
        } else {
            map['machine' + (idx-(numMachines*round))].add(val)
        }
    }
    return map
}

pipeline {
    agent {
        node {
            label 'linuxvm'
        }
    }
    stages {
        stage('Setup up environment') {
            steps {
                sh 'npm install'
            }
        }
        stage('Cypress execution') {
            when {
                expression { params.SKIP_EXECUTION == false }
            }
            steps {
                script {
                    def map = getFeaturesGroupsToRun()
                      map.each{ key, value -> 
                          deploymentStages["${key}"] = {
                              stage("Stage ${key}") {
                                  catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                                      def testsList = (params.FEATURES!=null) ? params.FEATURES : map[key].join(',')
                                      sh "npx cypress run --headless --record false --spec=${testsList}"  
                                  }
                              }
                          }
                        }
                    parallel deploymentStages
                }
            }
        }
        // stage('Post Building Action') {
        //     when {
        //         expression { params.SKIP_EXECUTION == false }
        //     }
        //     steps {
        //             archiveArtifacts artifacts: '**/*.png', allowEmptyArchive: true, fingerprint: true
        //             archiveArtifacts artifacts: '**/*.mp4', allowEmptyArchive: true, fingerprint: true
        //     }
        // }
    }
}