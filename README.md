# Astraia
Astraia is a library of traversing objects.  
Astraia can be used by traversing abstract syntax tree (AST).

## How to use

### node.js
Install Astraia:
```
npm install astraia
```

Use module:
```js
var R = require('astraia');
```

### Browser
```html
<script src="astraia.js"></script>
```

## Examples

### Traversing AST of addtion or subtraction of constant
```js
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

// outputs 2
A.scan(rules, {
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
});
```
