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
		if(typeof ptn === "function") {
			return ptn(obj, memory);
		} else if(isObject(ptn)) {
			for(i in ptn) {
				if(ptn.hasOwnProperty(i)) {
					if(!matchTree(ptn[i], obj[i], memory)) {
						return false;
					}
				}
			}
			return true;
		} else {
			return ptn === obj;
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
			/**
			 * @class Astraia
			 * scans and replaces the object by the given rule.
			 * @param {Object} rules to replace
			 * @param {Object} an object to replace
			 * @return {Object} a replaced object by the rules
			 * @ja
			 * オブジェクトを与えられた規則に従って置き換えます。
			 * ```
			 * var rules = [{
			 * 	pattern: {
			 * 	  "type": A.eqv("add"),
			 * 	  "left": A.number,
 			 * 	  "right": A.number
			 * 	},
 			 * 	action: function(obj) {
			 * 	  return obj.left + obj.right;
 			 * 	}
			 * }, {
			 * 	pattern: {
			 * 	  "type": A.eqv("sub"),
			 * 	  "left": A.number,
			 * 	  "right": A.number
			 * 	},
			 * 	action: function(obj) {
			 * 	  return obj.left - obj.right;
			 * 	}
			 * }];
			 * 
			 * // outputs 2
			 * A.scan(rules, {
			 * 	"type": "add",
			 * 	"left": {
			 * 	  "type": "add",
			 * 	  "left": 1,
			 * 	  "right": 2
			 * 	},
			 * 	"right": {
			 * 	  "type": "sub",
			 * 	  "left": 3,
			 * 	  "right": 4
			 * 	}
			 * });
			 * ```
			 */
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
			/**
			 * @class Astraia
			 * A placeholder which a value is equal to the given value.
			 * @param {Object} a value to be compared
			 * @ja
			 * 走査中に出現した値が与えられた値と等しいかを判別するプレースホルダです。
			 * ```
			 * A.eqv(765)
			 * ```
			 */
			eqv: function(eqv) {
				return function(obj) {
					return eqv === obj;
				};
			},
			/**
			 * @class Astraia
			 * A placeholder which an object is equal to the given object.  
			 * The object is compared by deep comparison.
			 * @param {Object} an object to be compared
			 * @ja
			 * 走査中に出現したオブジェクトが与えられたオブジェクトと等しいかを判別するプレースホルダです。  
			 * オブジェクトは構造も含めて比較されます。
			 * ```
			 * A.equal({
			 * 	"name": "Rin Shibuya",
			 * 	"age": 15
			 * })
			 * ```
			 */
			equal: function(eqv) {
				return function(obj) {
					return isEqual(eqv, obj);
				};
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is not null or undefined.
			 * @ja
			 * 走査中に出現した値がnullか未定義でないかを判別するプレースホルダです。
			 * ```
			 * A.any
			 * ```
			 */
			any: function(obj) {
				return obj !== undef && obj !== null;
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is a number.
			 * @ja
			 * 走査中に出現した値が数値であるかを判別するプレースホルダです。
			 * ```
			 * A.number
			 * ```
			 */
			number: function(obj) {
				return typeof obj === "number";
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is a string.
			 * @ja
			 * 走査中に出現した値が文字列であるかを判別するプレースホルダです。
			 * ```
			 * A.string
			 * ```
			 */
			string: function(obj) {
				return typeof obj === "string";
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is an object and is not an array.
			 * @ja
			 * 走査中に出現した値が配列でないオブジェクトかを判別するプレースホルダです。
			 * ```
			 * A.object
			 * ```
			 */
			object: function(obj) {
				return typeof obj === "object" && obj !== null && !isArray(obj);
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is an array.
			 * @ja
			 * 走査中に出現した値が配列かを判別するプレースホルダです。
			 * ```
			 * A.array
			 * ```
			 */
			array: function(obj) {
				return isArray(obj);
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is matched to the given regex.
			 * @param {Regex} a value to be compared
			 * @ja
			 * 走査中に出現した値が与えられた正規表現とマッチするかを判別するプレースホルダです。
			 * ```
			 * A.regex(/765|346|283/)
			 * ```
			 */
			regex: function(regex) {
				return function(obj) {
					return typeof obj === "string" && regex.test(obj);
				};
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is in the given range.
			 * @param {Number} minimum of range
			 * @param {Number} maximum of range
			 * @ja
			 * 走査中に出現した値が数値で、与えられた範囲内にあるかを判別するプレースホルダです。
			 * ```
			 * A.range(346, 765)
			 * ```
			 */
			range: function(minimum, maximum) {
				return function(obj) {
					return typeof obj === "number" && obj >= minimum && obj <= maximum;
				};
			},
			/**
			 * @class Astraia
			 * A placeholder which all elements of an array are fulfilled by the given predicate.
			 * @param {Function} the predicate to fullfil
			 * @ja
			 * 走査中に出現した配列の全ての要素が与えられた述語を満たすかを判別するプレースホルダです。
			 * ```
			 * A.all(A.number)
			 * ```
			 */
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
			/**
			 * @class Astraia
			 * A placeholder which one of the elements of an array is fulfilled by the given predicate.
			 * @param {Function} the predicate to fillfil
			 * @ja
			 * 走査中に出現した配列の1つの要素が与えられた述語を満たすかを判別するプレースホルダです。
			 * ```
			 * A.all(A.number)
			 * ```
			 */
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
			/**
			 * @class Astraia
			 * A placeholder which memorize a value.
			 * @param {String} the name
			 * @ja
			 * 走査中に出現した値を記録するプレースホルダです。
			 * ```
			 * A.memory("memo")
			 * ```
			 */
			memory: function(name) {
				return function(obj, memory) {
					memory[name] = deepCopy(obj);
					return true;
				};
			},
			/**
			 * @class Astraia
			 * A placeholder which a value is equals to the memorized value.  
			 * The object is compared by deep comparison.
			 * @param {String} the name
			 * @ja
			 * 走査中に出現した値が記録したオブジェクトに等しいかを判定するプレースホルダです。
			 * オブジェクトは構造も含めて比較されます。
			 * ```
			 * A.refer("memo")
			 * ```
			 */
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
