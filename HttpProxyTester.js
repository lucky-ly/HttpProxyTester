"use strict";


beforeAll(function(){
    console.log('utils loaded');

    window.top.HttpProxyTester = HttpProxyTester;

    function HttpProxyTester(httpBackend, backendUrl, service) {
        var tester = this;
        tester.__backend = httpBackend;
        tester.__backendUrl = backendUrl;
        tester.__service = service;
        tester.__testCases = [];

        tester.method = function(methodName) {
            console.log('new case:');
            var newCase = new tester.TestCase(methodName);
            tester.__testCases.push(newCase);
            return newCase;
        };

        tester.runAll = function() {
            for (var i = 0; i < tester.__testCases.length; i++) {
                tester.run(tester.__testCases[i]);
            }
        };

        tester.run = function(testCase) {
            console.log('case:',testCase);
            var tCase = testCase.__case;
            it('. ' + tCase.method + ' should request correct url', function(done) {
                tester.__backend["expect"+tCase.request.method]
                    (tester.__backendUrl + tCase.request.url)
                    .respond(tCase.response.code, tCase.response.data);

                var errorCallback = jasmine.createSpy('errorCallback');
                var successCallback = function (response) { //jshint ignore:line
                    expect(response.data).toEqual(tCase.response.data);
                    expect(response.status).toEqual(tCase.response.code);
                    done();
                };

                var expectError = !!tCase.response.data && !!tCase.response.data.errors;

                service[tCase.method].apply(service, tCase.args)
                    .then(
                        expectError ? errorCallback : successCallback,
                        expectError ? successCallback : errorCallback
                    );

                tester.__backend.flush();

                expect(errorCallback).not.toHaveBeenCalled();
            });
        };


        tester.TestCase = function(methodName) {
            var testCase = this;
            testCase.__case = {};
            testCase.__case.method = methodName;
            testCase.__case.args = [];
            testCase.__case.request = {};
            testCase.__case.response = {};

            testCase.method = function(methodName) {
                testCase.__case.method = methodName;
                return testCase;
            };

            testCase.callWith = function() {
                testCase.__case.args = arguments;
                return testCase;
            };

            testCase.expectRequest = function(method, url) {
                testCase.__case.request = {
                    method: method,
                    url: url
                };
                return testCase;
            };

            testCase.expectResponse = function(code, data) {
                testCase.__case.response = {
                    code: code,
                    data: data
                };
                return testCase;
            };
        };
    }
});