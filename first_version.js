/*
    init your angular+jasmine tests
    define variables "service", "httpBackend" and "fakeApiUrl" in describe block
    set them in beforeEach
    voila! you can use this thing to test your service which behaves as proxy to $http
*/
    "use strict";
    var httpBackend, service, fakeApiUrl;

    var httpProxy = {
        TestCase: function() {
            var testCase = this;
            testCase.method = "";
            testCase.args = [];
            testCase.request = {};
            testCase.response = {};

            this.callMethod = function(methodName) {
                testCase.method = methodName;
                return testCase;
            };

            this.withArguments = function() {
                testCase.args = arguments;
                return testCase;
            };

            this.expectRequest = function(method, url) {
                testCase.request = {
                    method: method,
                    url: url
                };
                return testCase;
            };

            this.expectResponse = function(code, data) {
                testCase.response = {
                    code: code,
                    data: data
                };
                return testCase;
            };
        },

        runTest: function(testCase) {
                it('. ' + testCase.method + ' should request correct url', function(done) {
                httpBackend["expect"+testCase.request.method]
                    (fakeApiUrl + testCase.request.url)
                    .respond(testCase.response.code, testCase.response.data);

                var errorCallback = jasmine.createSpy('errorCallback');
                var successCallback = function (response) { //jshint ignore:line
                    expect(response.data).toEqual(testCase.response.data);
                    expect(response.status).toEqual(testCase.response.code);
                    done();
                };

                var expectError = !!testCase.response.data && !!testCase.response.data.errors;

                service[testCase.method].apply(service, testCase.args)
                    .then(
                        expectError ? errorCallback : successCallback,
                        expectError ? successCallback : errorCallback
                    );

                httpBackend.flush();

                expect(errorCallback).not.toHaveBeenCalled();
            });
        }
    };