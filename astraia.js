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
	function isObject(obj) {
		return typeof obj === "object" && obj !== null;
	}
	function isEqual(obj1, obj2) {
		var i;
		if(isObject(obj1) && typeof isObject(obj2)) {
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
		} else if(isObject(obj)) {
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
		if(typeof ptn !== "function") {
			for(i in ptn) {
				if(ptn.hasOwnProperty(i)) {
					if(!matchTree(ptn[i], obj[i], memory)) {
						return false;
					}
				}
			}
			return true;
		} else {
			return ptn(obj, memory);
		}
	}
	function scanPattern(ptn, obj, action) {
		var i,
			scanned;
		if(isObject(obj)) {
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
		var me;
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
				for(resultOld = source; (result = me.scanOnce(rules, resultOld)).replaced; resultOld = result.result) {
					if(isEqual(result.result, resultOld)) {
						break;
					}
				}
				return resultOld;
			},
			eqv: function(eqv) {
				return function(obj) {
					return eqv === obj;
				};
			},
			equal: function(eqv) {
				return function(obj) {
					return isEqual(eqv, obj);
				};
			},
			any: function(obj) {
				return obj !== undef && obj !== null;
			},
			number: function(obj) {
				return typeof obj === "number";
			},
			string: function(obj) {
				return typeof obj === "string";
			},
			object: function(obj) {
				return typeof obj === "object" && obj !== null && !isArray(obj);
			},
			array: function(obj) {
				return isArray(obj);
			},
			regex: function(regex) {
				return function(obj) {
					return typeof obj === "string" && regex.test(obj);
				};
			},
			range: function(minimum, maximum) {
				return function(obj) {
					return typeof obj === "number" && obj >= minimum && obj <= maximum;
				};
			},
			all: function(pred) {
				return function(obj) {
					var i;
					if(!isArray(obj)) {
						return false;
					}
					for(i = 0; i < obj.length; i++) {
						if(!pred(obj[i])) {
							return false;
						}
					}
					return true;
				};
			},
			exists: function(pred) {
				return function(obj) {
					var i;
					if(!isArray(obj)) {
						return false;
					}
					for(i = 0; i < obj.length; i++) {
						if(pred(obj[i])) {
							return true;
						}
					}
					return false;
				};
			},
			memory: function(name) {
				return function(obj, memory) {
					memory[name] = deepCopy(obj);
					return true;
				};
			},
			refer: function(name) {
				return function(obj, memory) {
					return isEqual(obj, memory[name]);
				};
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
