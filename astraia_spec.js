/*
 * Astraia.js
 *
 * Copyright (c) 2018 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
/*
 * This test case describe by Jasmine.
 */
describe("Astraia", function () {
    function isEqual(obj1, obj2) {
        var i;
        if(typeof obj1 === "object" && typeof obj2 === "object") {
            for(i in obj1) {
                if(obj1.hasOwnProperty(i)) {
                    if(!isEqual(obj1[i], obj2[i])) {
                        return false;
                    }
                }
            }
            for(i in obj2) {
                if(obj2.hasOwnProperty(i)) {
                    if(!isEqual(obj2[i], obj1[i])) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return obj1 === obj2;
        }
    }

    function eqOnce(rules, obj1, obj2) {
        var res = A.scanOnce(rules, obj1);
        expect(res.replaced).toBe(true);
        expect(isEqual(res.result, obj2)).toBe(true);
    }

    function neOnce(rules, obj1) {
        var res = A.scanOnce(rules, obj1);
        expect(res.replaced).toBe(false);
    }

    function eq(rules, obj1, obj2) {
        var res = A.scan(rules, obj1);
        expect(isEqual(res, obj2)).toBe(true);
    }

    function ne(rules, obj1) {
        eq(rules, obj1, obj1);
    }

    beforeEach(function () {
    });

    describe("testing scanOnce", function () {
        it("scanOnce1", function () {
            var rules = [{
                pattern: {
                    "type": A.eqv("assign"),
                    "left": A.memory("left"),
                    "right": {
                        "type": A.eqv("add"),
                        "left": A.refer("left"),
                        "right": A.eqv(1)
                    }
                },
                action: function(obj) {
                    return {
                        "type": "inc",
                        "variable": obj.left
                    };
                }
            }];
            eqOnce(rules, {
                "type": "assign",
                "left": "a",
                "right": {
                    "type": "add",
                    "left": "a",
                    "right": 1
                }
            }, {
                "type": "inc",
                "variable": "a"
            });
            eqOnce(rules, {
                "type": "assign",
                "left": "b",
                "right": {
                    "type": "assign",
                    "left": "a",
                    "right": {
                        "type": "add",
                        "left": "a",
                        "right": 1
                    }
                }
            }, {
                "type": "assign",
                "left": "b",
                "right": {
                    "type": "inc",
                    "variable": "a"
                }
            });
            neOnce(rules, {
                "type": "assign",
                "left": "a",
                "right": {
                    "type": "add",
                    "left": "b",
                    "right": 1
                }
            });
        });
    });

    describe("testing scan", function () {
        it("scan1", function () {
            var rules = [{
                pattern: {
                    "type": A.eqv("add"),
                    "left": A.number,
                    "right": A.number
                },
                action: function(obj) {
                    return obj.left + obj.right;
                }
            }];
            eq(rules, {
                "type": "add",
                "left": 2,
                "right": 3
            }, 5);
            eq(rules, {
                "type": "add",
                "left": {
                    "type": "add",
                    "left": 1,
                    "right": 2
                },
                "right": {
                    "type": "add",
                    "left": 3,
                    "right": 4
                }
            }, 10);
        });
        it("scan2", function () {
            var rules = [{
                pattern: {
                    "type": A.eqv("add"),
                    "left": A.number,
                    "right": A.number
                },
                action: function(obj) {
                    return obj.left + obj.right;
                }
            }, {
                pattern: {
                    "type": A.eqv("sub"),
                    "left": A.number,
                    "right": A.number
                },
                action: function(obj) {
                    return obj.left - obj.right;
                }
            }];
            eq(rules, {
                "type": "sub",
                "left": 2,
                "right": 3
            }, -1);
            eq(rules, {
                "type": "add",
                "left": {
                    "type": "add",
                    "left": 1,
                    "right": 2
                },
                "right": {
                    "type": "sub",
                    "left": 3,
                    "right": 4
                }
            }, 2);
        });
    });

    describe("testing pred", function () {
        it("equal", function () {
            var rules = [{
                pattern: A.equal({
                    "a1": "v1",
                    "a2": "v2"
                }),
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, {
                "a1": "v1",
                "a2": "v2"
            }, "OK");
            ne(rules, {
                "a2": "v2"
            });
            ne(rules, {
                "a1": "v1",
                "a2": "v2",
                "a3": "extra"
            });
        });
        it("any", function () {
            var rules = [{
                pattern: A.any,
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, {
                "a1": "v1",
                "a2": "v2"
            }, "OK");
            eq(rules, 1, "OK");
            eq(rules, "1", "OK");
            ne(rules, null);
            ne(rules, void 0);
        });
        it("number", function () {
            var rules = [{
                pattern: A.number,
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, 1, "OK");
            ne(rules, {});
            ne(rules, []);
            ne(rules, "1");
            ne(rules, null);
            ne(rules, void 0);
        });
        it("string", function () {
            var rules = [{
                pattern: A.string,
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, "1", "OK");
            ne(rules, {});
            ne(rules, []);
            ne(rules, 1);
            ne(rules, null);
            ne(rules, void 0);
        });
        it("object", function () {
            var rules = [{
                pattern: A.object,
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, {}, "OK");
            ne(rules, []);
            ne(rules, 1);
            ne(rules, "1");
            ne(rules, null);
            ne(rules, void 0);
        });
        it("array", function () {
            var rules = [{
                pattern: A.array,
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, [], "OK");
            ne(rules, {});
            ne(rules, 1);
            ne(rules, "1");
            ne(rules, null);
            ne(rules, void 0);
        });
        it("regex", function () {
            var rules = [{
                pattern: A.regex(/[0-8][0-9][0-9]/),
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, "765", "OK");
            ne(rules, "961");
            ne(rules, {});
            ne(rules, []);
            ne(rules, 1);
            ne(rules, null);
            ne(rules, void 0);
        });
        it("range", function () {
            var rules = [{
                pattern: A.range(283, 876),
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, 765, "OK");
            eq(rules, 283, "OK");
            eq(rules, 876, "OK");
            ne(rules, 282);
            ne(rules, 877);
            ne(rules, 961);
            ne(rules, {});
            ne(rules, []);
            ne(rules, "1");
            ne(rules, null);
            ne(rules, void 0);
        });
        it("all", function () {
            var rules = [{
                pattern: A.all(A.range(283, 876)),
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, [283, 346, 765, 876], "OK");
            eq(rules, [], "OK");
            ne(rules, [283, 346, 765, 876, 961]);
            ne(rules, {});
            ne(rules, 1);
            ne(rules, null);
            ne(rules, void 0);
        });
        it("exists", function () {
            var rules = [{
                pattern: A.exists(A.range(765, 876)),
                action: function(obj) {
                    return "OK";
                }
            }];
            eq(rules, [283, 346, 765], "OK");
            ne(rules, [283, 346, 961]);
            ne(rules, []);
            ne(rules, {});
            ne(rules, 1);
            ne(rules, null);
            ne(rules, void 0);
        });
    });
});

