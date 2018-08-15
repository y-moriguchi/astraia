/*
 * Astraia.js
 *
 * Copyright (c) 2018 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
(function(root) {
	var undef = void 0,
		Astraia;
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
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
	function deepCopy(obj) {
		var i,
			res;
		if(isArray(obj)) {
			res = [];
			for(i = 0; i < obj.length; i++) {
				res[i] = deepCopy(obj[i]);
			}
		} else if(typeof obj === "object") {
			res = {};
			for(i in obj) {
				if(obj.hasOwnProperty(i)) {
					res[i] = deepCopy(obj[i]);
				}
			}
		} else {
			res = obj;
		}
		return res;
	}
	function matchTree(ptn, obj, memory) {
		var i;
		if(typeof ptn === "object" && typeof ptn.test !== "function") {
			for(i in ptn) {
				if(ptn.hasOwnProperty(i)) {
					if(!matchTree(ptn[i], obj[i], memory)) {
						return false;
					}
				}
			}
			return true;
		} else {
			return ptn.test(obj, memory);
		}
	}
	function scanPattern(ptn, obj, action) {
		var i,
			scanned;
		if(typeof obj === "object" && typeof ptn === "object") {
			for(i in obj) {
				if(obj.hasOwnProperty(i)) {
					if(matchTree(ptn, obj[i], {})) {
						obj[i] = action(obj[i]);
						return true;
					} else if(scanPattern(ptn, obj[i], action)) {
						return true;
					}
				}
			}
			return false;
		} else {
			return false;
		}
	}
	Astraia = (function() {
		var me,
			predAny,
			predNumber,
			predMemory;
		function PredEqv(obj) {
			this.eqv = obj;
		}
		function PredMemory(name) {
			this.name = name;
		}
		function PredRefer(name) {
			this.name = name;
		}
		PredEqv.prototype = {
			test: function(obj) {
				return this.eqv === obj;
			}
		};
		PredMemory.prototype = {
			test: function(obj, memory) {
				memory[this.name] = deepCopy(obj);
				return true;
			}
		};
		PredRefer.prototype = {
			test: function(obj, memory) {
				return isEqual(obj, memory[this.name]);
			}
		};
		predAny = {
			test: function(obj) {
				return obj !== undef && obj !== null;
			}
		};
		predNumber = {
			test: function(obj) {
				return typeof obj === "number";
			}
		};
		me = {
			scanOnce: function(rules, source) {
				var i,
					obj;
				obj = {
					root: deepCopy(source)
				};
				for(i = 0; i < rules.length; i++) {
					if(scanPattern(rules[i].pattern, obj, rules[i].action)) {
						return {
							replaced: true,
							result: obj.root
						}
					}
				}
				return {
					replaced: false
				};
			},
			scan: function(rules, source) {
				var result,
					resultOld;
				for(resultOld = source; (result = me.scanOnce(rules, resultOld)).replaced; resultOld = result.result) {}
				return resultOld;
			},
			eqv: function(obj) {
				return new PredEqv(obj);
			},
			any: predAny,
			number: predNumber,
			memory: function(name) {
				return new PredMemory(name);
			},
			refer: function(name) {
				return new PredRefer(name);
			}
		};
		return me;
	})();
	if(typeof module !== "undefined" && module.exports) {
		module.exports = Astraia;
	} else {
		root["Astraia"] = root["A"] = Astraia;
	}
})(this);
