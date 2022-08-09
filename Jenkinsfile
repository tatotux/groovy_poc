#!/usr/bin/env groovy
def deploymentStages = [:]

/*
 * This function reads the list of specs and sends
   that list to funciton "assignFeatureToMachine"
 */
def getSpecsGroupsToRun() {
    def numMachines = "${CONTAINERS}".toInteger()
    def list = sh(script: "find cypress/e2e/**/*cy.js -name '*cy.js' -print0 | xargs -0 | tr  ' ' ,", returnStdout: true)
    def map = assignSpecsToMachine(numMachines, list)

    print 'Number of containers: ' + numMachines
    map.each { key, value -> 
        print 'Size: ' + value.size() + ' '   + key + ' ' + value
    }
    return map
}

/*
 * This function gets the list of specs and assign each one
   to a machine to be executed
 */
def assignSpecsToMachine(numMachines, list) {
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
    options {
        ansiColor('xterm')
    }
    stages {
        stage('Setup up environment') {
            steps {
                sh 'npm install'
            }
        }
        stage('Cypress execution') {
            steps {
                script {
                    def map = getSpecsGroupsToRun()
                      map.each{ key, value -> 
                          deploymentStages["${key}"] = {
                              stage("Stage ${key}") {
                                  catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                                      def testsList = (params.SPECS!=null) ? params.SPECS : map[key].join(',')
                                      sh "npx cypress run --env allure=true --spec=${testsList}"  
                                  }
                              }
                          }
                        }
                    parallel deploymentStages
                }
            }
        }
        stage('Reporting') {
            steps {
                allure([
                    includeProperties: true,
                    jdk: '',
                    properties: [],
                    reportBuildPolicy: 'ALWAYS',
                    report: "allure-report",
                    results: [[path: "allure-results"]]
                ])
            }
        }
        stage('Post Building Action') {
            steps {
                    archiveArtifacts artifacts: '**/*.png', allowEmptyArchive: true, fingerprint: true
                    archiveArtifacts artifacts: '**/*.mp4', allowEmptyArchive: true, fingerprint: true
            }
        }
    }
}