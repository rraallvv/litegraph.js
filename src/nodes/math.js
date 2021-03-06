(function() {

// Converter
function Converter() {
	this.addInput("in", "*");
}

Converter.title = "Converter";
Converter.desc = "type A to type B";

Converter.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}

	if ( this.outputs ) {
		for ( var i = 0; i < this.outputs.length; i++ ) {
			var output = this.outputs[ i ];
			if ( !output.links || !output.links.length ) {
				continue;
			}

			var result = null;
			switch ( output.name ) {
				case "number": result = v.length ? v[ 0 ] : parseFloat( v ); break;
				case "vec2":
				case "vec3":
				case "vec4":
					result = null;
					var count = 1;
					switch ( output.name ) {
						case "vec2": count = 2; break;
						case "vec3": count = 3; break;
						case "vec4": count = 4; break;
					}

					result = new Float32Array( count );
					if ( v.length ) {
						for ( var j = 0; j < v.length && j < result.length; j++ ) {
							result[ j ] = v[ j ];
						}
					} else {
						result[ 0 ] = parseFloat( v );
					}
					break;
			}
			this.setOutputData( i, result );
		}
	}
};

Converter.prototype.onGetOutputs = function() {
	return [ [ "number", "number" ], [ "vec2", "vec2" ], [ "vec3", "vec3" ], [ "vec4", "vec4" ] ];
};

LiteGraph.registerNodeType("math/converter", Converter );


// Bypass
function Bypass() {
	this.addInput("in");
	this.addOutput("out");
}

Bypass.title = "Bypass";
Bypass.desc = "removes the type";

Bypass.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	this.setOutputData( 0, v );
};

LiteGraph.registerNodeType("math/bypass", Bypass );



function MathRange() {
	this.addInput("in", "number", { locked:true });
	this.addOutput("out", "number", { locked:true });

	this.addProperties({
		in: 0,
		inMin: 0,
		inMax: 1,
		outMin: 0,
		outMax: 1
	});
}

MathRange.title = "Range";
MathRange.desc = "Convert a number from one range to another";

MathRange.prototype.onExecute = function() {
	var v;

	if ( this.inputs ) {
		for ( var i = 0; i < this.inputs.length; i++ ) {
			var input = this.inputs[ i ];
			v = this.getInputData( i );
			if ( v === undefined ) {
				continue;
			}
			this.properties[ input.name ] = v;
		}
	}

	v = this.properties.in;
	if ( v === undefined || v === null || v.constructor !== Number ) {
		v = 0;
	}

	var inMin = this.properties.inMin;
	var inMax = this.properties.inMax;
	var outMin = this.properties.outMin;
	var outMax = this.properties.outMax;

	this._lastV = ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
	this.setOutputData( 0, this._lastV );
};

MathRange.prototype.onDrawBackground = function( ctx ) { // eslint-disable-line no-unused-vars
	// show the current value
	if ( this._lastV ) {
		this.outputs[ 0 ].label = this._lastV.toFixed( 3 );
	} else {
		this.outputs[ 0 ].label = "?";
	}
};

MathRange.prototype.onGetInputs = function() {
	return [ [ "inMin", "number" ], [ "inMax", "number" ], [ "outMin", "number" ], [ "outMax", "number" ] ];
};

LiteGraph.registerNodeType("math/range", MathRange );



function MathRand() {
	this.addOutput("value", "number");
	this.addProperties({
		min: 0,
		max: 1
	});
}

MathRand.title = "Rand";
MathRand.desc = "Random number";

MathRand.prototype.onExecute = function() {
	if ( this.inputs ) {
		for ( var i = 0; i < this.inputs.length; i++ ) {
			var input = this.inputs[ i ];
			var v = this.getInputData( i );
			if ( v === undefined ) {
				continue;
			}
			this.properties[ input.name ] = v;
		}
	}

	var min = this.properties.min;
	var max = this.properties.max;
	this._lastV = Math.random() * (max - min) + min;
	this.setOutputData( 0, this._lastV );
};

MathRand.prototype.onDrawBackground = function( ctx ) { // eslint-disable-line no-unused-vars
	// show the current value
	if ( this._lastV ) {
		this.outputs[ 0 ].label = this._lastV.toFixed( 3 );
	} else {
		this.outputs[ 0 ].label = "?";
	}
};

MathRand.prototype.onGetInputs = function() {
	return [ [ "min", "number" ], [ "max", "number" ] ];
};

LiteGraph.registerNodeType("math/rand", MathRand );

// Math clamp
function MathClamp() {
	this.addInput("in", "number");
	this.addOutput("out", "number");
	this.addProperties({
		min: 0,
		max: 1
	});
}

MathClamp.title = "Clamp";
MathClamp.desc = "Clamp number between min and max";
MathClamp.filter = "shader";

MathClamp.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}
	v = Math.max( this.properties.min, v );
	v = Math.min( this.properties.max, v );
	this.setOutputData( 0, v );
};

MathClamp.prototype.getCode = function( lang ) { // eslint-disable-line no-unused-vars
	var code = "";
	if ( this.isInputConnected( 0 ) ) {
		code += "clamp({{0}}," + this.properties.min + "," + this.properties.max + ")";
	}
	return code;
};

LiteGraph.registerNodeType("math/clamp", MathClamp );


// Math ABS
function MathAbs() {
	this.addInput("in", "number");
	this.addOutput("out", "number");
}

MathAbs.title = "Abs";
MathAbs.desc = "Absolute";

MathAbs.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}
	this.setOutputData( 0, Math.abs( v ) );
};

LiteGraph.registerNodeType("math/abs", MathAbs );


// Math Floor
function MathFloor() {
	this.addInput("in", "number");
	this.addOutput("out", "number");
}

MathFloor.title = "Floor";
MathFloor.desc = "Floor number to remove fractional part";

MathFloor.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}
	this.setOutputData( 0, Math.floor( v ) );
};

LiteGraph.registerNodeType("math/floor", MathFloor );


// Math frac
function MathFrac() {
	this.addInput("in", "number");
	this.addOutput("out", "number");
}

MathFrac.title = "Frac";
MathFrac.desc = "Returns fractional part";

MathFrac.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}
	this.setOutputData( 0, v % 1 );
};

LiteGraph.registerNodeType("math/frac", MathFrac );


// Math Floor
function MathSmoothStep() {
	this.addInput("in", "number");
	this.addOutput("out", "number");
	this.properties = { A: 0, B: 1 };
}

MathSmoothStep.title = "Smoothstep";
MathSmoothStep.desc = "Smoothstep";

MathSmoothStep.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v === undefined ) {
		return;
	}

	var edge0 = this.properties.A;
	var edge1 = this.properties.B;

	// Scale, bias and saturate x to 0..1 range
	v = Math.clamp( (v - edge0) / (edge1 - edge0), 0.0, 1.0 );
	// Evaluate polynomial
	v = v * v * (3 - 2 * v);

	this.setOutputData( 0, v );
};

LiteGraph.registerNodeType("math/smoothStep", MathSmoothStep );

// Math scale
function MathScale() {
	this.addInput("in", "number", { label:"" });
	this.addOutput("out", "number", { label:"" });
	this.addProperties({
		factor: 1
	});
}

MathScale.title = "Scale";
MathScale.desc = "v * factor";

MathScale.prototype.onExecute = function() {
	var value = this.getInputData( 0 );
	if ( value != null ) {
		this.setOutputData( 0, value * this.properties.factor );
	}
};

LiteGraph.registerNodeType("math/scale", MathScale );


// Math operation
function MathOperation() {
	this.addInput("A", "number");
	this.addInput("B", "number");
	this.addOutput("=", "number");
	this.addProperties({
		A: 1,
		B: 1,
		OP: {
			default: "+",
			type: "string",
			values: MathOperation.values
		}
	});
}

MathOperation.values = [ "+", "-", "*", "/", "%", "^" ];

MathOperation.title = "Operation";
MathOperation.desc = "Easy math operators";
MathOperation[ "@OP" ] = { type:"enum", title: "operation", values: MathOperation.values };


MathOperation.prototype.setValue = function( v ) {
	if ( typeof(v) == "string") {
		v = parseFloat( v );
	}
	this.properties.value = v;
};

MathOperation.prototype.onExecute = function() {
	var A = this.getInputData( 0 );
	var B = this.getInputData( 1 );
	if ( A != null ) {
		this.properties.A = A;
	} else {
		A = this.properties.A;
	}

	if ( B != null ) {
		this.properties.B = B;
	} else {
		B = this.properties.B;
	}

	var result = 0;
	switch ( this.properties.OP ) {
		case "+": result = A + B; break;
		case "-": result = A - B; break;
		case "x":
		case "X":
		case "*": result = A * B; break;
		case "/": result = A / B; break;
		case "%": result = A % B; break;
		case "^": result = Math.pow( A, B ); break;
		default:
			console.warn("Unknown operation: " + this.properties.OP );
	}
	this.setOutputData( 0, result );
};

MathOperation.prototype.onDrawBackground = function( ctx ) {
	if ( this.flags.collapsed ) {
		return;
	}

	ctx.font = "40px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText( this.properties.OP, this.size[ 0 ] * 0.5, this.size[ 1 ] * 0.5 + LiteGraph.NODE_TITLE_HEIGHT );
	ctx.textAlign = "left";
};

LiteGraph.registerNodeType("math/operation", MathOperation );


// Math compare
function MathCompare() {
	this.addInput( "A", "number" );
	this.addInput( "B", "number" );
	this.addOutput("A==B", "boolean");
	this.addOutput("A!=B", "boolean");
	this.addProperties({
		A: 0,
		B: 0
	});
}

MathCompare.title = "Compare";
MathCompare.desc = "compares between two values";

MathCompare.prototype.onExecute = function() {
	var A = this.getInputData( 0 );
	var B = this.getInputData( 1 );
	if ( A !== undefined ) {
		this.properties.A = A;
	} else {
		A = this.properties.A;
	}

	if ( B !== undefined ) {
		this.properties.B = B;
	} else {
		B = this.properties.B;
	}

	for ( var i = 0, l = this.outputs.length; i < l; ++i ) {
		var output = this.outputs[ i ];
		if ( !output.links || !output.links.length ) {
			continue;
		}
		var value;
		switch ( output.name ) {
			case "A==B": value = A == B; break;
			case "A!=B": value = A != B; break;
			case "A>B": value = A > B; break;
			case "A<B": value = A < B; break;
			case "A<=B": value = A <= B; break;
			case "A>=B": value = A >= B; break;
		}
		this.setOutputData( i, value );
	}
};

MathCompare.prototype.onGetOutputs = function() {
	return [ [ "A==B", "boolean" ], [ "A!=B", "boolean" ], [ "A>B", "boolean" ], [ "A<B", "boolean" ], [ "A>=B", "boolean" ], [ "A<=B", "boolean" ] ];
};

LiteGraph.registerNodeType("math/compare", MathCompare );

function MathCondition() {
	this.addInput("A", "number");
	this.addInput("B", "number");
	this.addOutput("out", "boolean");
	this.addProperties({
		A: 1,
		B: 1,
		OP: {
			default: ">",
			type: "string",
			values: MathCondition.values
		}
	});
}

MathCondition.values = [ ">", "<", "==", "!=", "<=", ">=" ];
MathCondition[ "@OP" ] = { type:"enum", title: "operation", values: MathCondition.values };

MathCondition.title = "Condition";
MathCondition.desc = "evaluates condition between A and B";

MathCondition.prototype.onExecute = function() {
	var A = this.getInputData( 0 );
	if ( A === undefined ) {
		A = this.properties.A;
	} else {
		this.properties.A = A;
	}

	var B = this.getInputData( 1 );
	if ( B === undefined ) {
		B = this.properties.B;
	} else {
		this.properties.B = B;
	}

	var result = true;
	switch ( this.properties.OP ) {
		case ">": result = A > B; break;
		case "<": result = A < B; break;
		case "==": result = A == B; break;
		case "!=": result = A != B; break;
		case "<=": result = A <= B; break;
		case ">=": result = A >= B; break;
	}

	this.setOutputData( 0, result );
};

MathCondition.prototype.onDrawBackground = function( ctx ) {
	if ( this.flags.collapsed ) {
		return;
	}

	ctx.font = "40px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText( this.properties.OP, this.size[ 0 ] * 0.5, ctx.measureText( this.properties.OP, true ).ascent );
	ctx.textAlign = "left";
};

MathCondition.prototype.onComputeMinSize = function( ctx ) {
	if ( !this.properties || !this.properties.OP ) {
		return;
	}
	ctx.font = "40px Arial";
	var size = ctx.measureText( this.properties.OP, true ).size;
	return [ size[ 0 ], size[ 1 ] ];
};

LiteGraph.registerNodeType("math/condition", MathCondition );


function MathLogicCompare() {
	this.addInput("A", "boolean");
	this.addInput("B", "boolean");
	this.addOutput("out", "boolean");
	this.addProperties({
		A: true,
		B: true,
		OP: {
			default: "&&",
			type: "string",
			values: MathLogicCompare.values
		}
	});
}

MathLogicCompare.values = [ "&&", "||" ];
MathLogicCompare[ "@OP" ] = { type:"enum", title: "operation", values: MathLogicCompare.values };

MathLogicCompare.title = "Logic compare";
MathLogicCompare.desc = "evaluates logical opertion between A and B";

MathLogicCompare.prototype.onExecute = function() {
	var A = this.getInputData( 0 );
	if ( A === undefined ) {
		A = this.properties.A;
	} else {
		this.properties.A = A;
	}

	var B = this.getInputData( 1 );
	if ( B === undefined ) {
		B = this.properties.B;
	} else {
		this.properties.B = B;
	}

	var result = true;
	switch ( this.properties.OP ) {
		case "&&": result = A && B; break;
		case "||": result = A || B; break;
	}

	this.setOutputData( 0, result );
};

MathLogicCompare.prototype.onDrawBackground = function( ctx ) {
	if ( this.flags.collapsed ) {
		return;
	}

	ctx.font = "40px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText( this.properties.OP, this.size[ 0 ] * 0.5, ctx.measureText( this.properties.OP, true ).ascent );
	ctx.textAlign = "left";
};

MathLogicCompare.prototype.onComputeMinSize = function( ctx ) {
	if ( !this.properties || !this.properties.OP ) {
		return;
	}
	ctx.font = "40px Arial";
	var size = ctx.measureText( this.properties.OP, true ).size;
	return [ size[ 0 ], size[ 1 ] ];
};

LiteGraph.registerNodeType("math/logicCompare", MathLogicCompare );


function MathLogicNot() {
	this.addInput("in", "boolean");
	this.addOutput("out", "boolean");
	this.addProperties({
		in: true
	});
}

MathLogicNot.title = "Logic negation";
MathLogicNot.desc = "evaluates logical negation opertion";

MathLogicNot.prototype.onExecute = function() {
	var input = this.getInputData( 0 );
	if ( input === undefined ) {
		input = this.properties.input;
	} else {
		this.properties.input = input;
	}

	var result = true;
	if ( input ) {
		result = !input;
	}

	this.setOutputData( 0, result );
};

MathLogicNot.prototype.onDrawBackground = function( ctx ) {
	if ( this.flags.collapsed ) {
		return;
	}

	ctx.font = "40px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText("NOT", this.size[ 0 ] * 0.5, ctx.measureText("NOT", true ).ascent );
	ctx.textAlign = "left";
};

MathLogicNot.prototype.onComputeMinSize = function( ctx ) {
	ctx.font = "40px Arial";
	var size = ctx.measureText("NOT", true ).size;
	return [ size[ 0 ], size[ 1 ] ];
};

LiteGraph.registerNodeType("math/logicNot", MathLogicNot );


function MathAccumulate() {
	this.addInput("inc", "number");
	this.addOutput("total", "number");
	this.addProperties({
		increment: 1,
		value: 0
	});
}

MathAccumulate.title = "Accumulate";
MathAccumulate.desc = "Increments a value every time";

MathAccumulate.prototype.onExecute = function() {
	var inc = this.getInputData( 0 );
	if ( inc !== null ) {
		this.properties.value += inc;
	} else {
		this.properties.value += this.properties.increment;
	}
	this.setOutputData( 0, this.properties.value );
};

LiteGraph.registerNodeType("math/accumulate", MathAccumulate );

// Math Trigonometry
function MathTrigonometry() {
	this.addInput("v", "number");
	this.addOutput("sin", "number");

	this.addProperties({
		amplitude: 1,
		offset: 0
	});
	this.bgImageUrl = "imgs/icon-sin.png";
}

MathTrigonometry.title = "Trigonometry";
MathTrigonometry.desc = "Sin Cos Tan";
MathTrigonometry.filter = "shader";

MathTrigonometry.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	var amplitude = this.properties.amplitude;
	var slot = this.findInputSlot("amplitude");
	if ( slot != -1 ) {
		amplitude = this.getInputData( slot );
	}
	var offset = this.properties.offset;
	slot = this.findInputSlot("offset");
	if ( slot != -1 ) {
		offset = this.getInputData( slot );
	}

	for ( var i = 0, l = this.outputs.length; i < l; ++i ) {
		var output = this.outputs[ i ];
		var value;
		switch ( output.name ) {
			case "sin": value = Math.sin( v ); break;
			case "cos": value = Math.cos( v ); break;
			case "tan": value = Math.tan( v ); break;
			case "asin": value = Math.asin( v ); break;
			case "acos": value = Math.acos( v ); break;
			case "atan": value = Math.atan( v ); break;
		}
		this.setOutputData( i, amplitude * value + offset );
	}
};

MathTrigonometry.prototype.onGetInputs = function() {
	return [ [ "v", "number" ], [ "amplitude", "number" ], [ "offset", "number" ] ];
};


MathTrigonometry.prototype.onGetOutputs = function() {
	return [ [ "sin", "number" ], [ "cos", "number" ], [ "tan", "number" ], [ "asin", "number" ], [ "acos", "number" ], [ "atan", "number" ] ];
};


LiteGraph.registerNodeType("math/trigonometry", MathTrigonometry );



// math library for safe math operations without eval
if ( window.math ) {
(function() {

	function MathFormula() {
		this.addInputs("x", "number");
		this.addInputs("y", "number");
		this.addOutputs("", "number");
		this.properties = { x:1.0, y:1.0, formula:"x+y" };
	}

	MathFormula.title = "Formula";
	MathFormula.desc = "Compute safe formula";

	MathFormula.prototype.onExecute = function() {
		var x = this.getInputData( 0 );
		var y = this.getInputData( 1 );
		if ( x != null ) {
			this.properties.x = x;
		} else {
			x = this.properties.x;
		}

		if ( y != null ) {
			this.properties.y = y;
		} else {
			y = this.properties.y;
		}

		var f = this.properties.formula;
		var value = math.eval( f, { x:x, y:y, T: this.graph.globaltime }); // eslint-disable-line no-undef
		this.setOutputData( 0, value );
	};

	MathFormula.prototype.onDrawBackground = function() {
		var f = this.properties.formula;
		this.outputs[ 0 ].label = f;
	};

	MathFormula.prototype.onGetOutputs = function() {
		return [ [ "A-B", "number" ], [ "A*B", "number" ], [ "A/B", "number" ] ];
	};

	LiteGraph.registerNodeType("math/formula", MathFormula );

})();
}


function Math3DVec2ToXYZ() {
	this.addInput("vec2", "vec2");
	this.addOutput("x", "number");
	this.addOutput("y", "number");
}

Math3DVec2ToXYZ.title = "Vec2->XY";
Math3DVec2ToXYZ.desc = "vector 2 to components";

Math3DVec2ToXYZ.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}

	this.setOutputData( 0, v[ 0 ] );
	this.setOutputData( 1, v[ 1 ] );
};

LiteGraph.registerNodeType("math3d/vec2-to-xyz", Math3DVec2ToXYZ );


function Math3DXYToVec2() {
	this.addInputs([ [ "x", "number" ], [ "y", "number" ] ]);
	this.addOutput("vec2", "vec2");
	this.properties = { x:0, y:0 };
	this._data = new Float32Array( 2 );
}

Math3DXYToVec2.title = "XY->Vec2";
Math3DXYToVec2.desc = "components to vector2";

Math3DXYToVec2.prototype.onExecute = function() {
	var x = this.getInputData( 0 );
	if ( x == null ) {
		x = this.properties.x;
	}
	var y = this.getInputData( 1 );
	if ( y == null ) {
		y = this.properties.y;
	}

	var data = this._data;
	data[ 0 ] = x;
	data[ 1 ] = y;

	this.setOutputData( 0, data );
};

LiteGraph.registerNodeType("math3d/xy-to-vec2", Math3DXYToVec2 );




function Math3DVec3ToXYZ() {
	this.addInput("vec3", "vec3");
	this.addOutput("x", "number");
	this.addOutput("y", "number");
	this.addOutput("z", "number");
}

Math3DVec3ToXYZ.title = "Vec3->XYZ";
Math3DVec3ToXYZ.desc = "vector 3 to components";

Math3DVec3ToXYZ.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}

	this.setOutputData( 0, v[ 0 ] );
	this.setOutputData( 1, v[ 1 ] );
	this.setOutputData( 2, v[ 2 ] );
};

LiteGraph.registerNodeType("math3d/vec3-to-xyz", Math3DVec3ToXYZ );


function Math3DXYZToVec3() {
	this.addInputs([ [ "x", "number" ], [ "y", "number" ], [ "z", "number" ] ]);
	this.addOutput("vec3", "vec3");
	this.properties = { x:0, y:0, z:0 };
	this._data = new Float32Array( 3 );
}

Math3DXYZToVec3.title = "XYZ->Vec3";
Math3DXYZToVec3.desc = "components to vector3";

Math3DXYZToVec3.prototype.onExecute = function() {
	var x = this.getInputData( 0 );
	if ( x == null ) {
		x = this.properties.x;
	}
	var y = this.getInputData( 1 );
	if ( y == null ) {
		y = this.properties.y;
	}
	var z = this.getInputData( 2 );
	if ( z == null ) {
		z = this.properties.z;
	}

	var data = this._data;
	data[ 0 ] = x;
	data[ 1 ] = y;
	data[ 2 ] = z;

	this.setOutputData( 0, data );
};

LiteGraph.registerNodeType("math3d/xyz-to-vec3", Math3DXYZToVec3 );



function Math3DVec4ToXYZW() {
	this.addInput("vec4", "vec4");
	this.addOutput("x", "number");
	this.addOutput("y", "number");
	this.addOutput("z", "number");
	this.addOutput("w", "number");
}

Math3DVec4ToXYZW.title = "Vec4->XYZW";
Math3DVec4ToXYZW.desc = "vector 4 to components";

Math3DVec4ToXYZW.prototype.onExecute = function() {
	var v = this.getInputData( 0 );
	if ( v == null ) {
		return;
	}

	this.setOutputData( 0, v[ 0 ] );
	this.setOutputData( 1, v[ 1 ] );
	this.setOutputData( 2, v[ 2 ] );
	this.setOutputData( 3, v[ 3 ] );
};

LiteGraph.registerNodeType("math3d/vec4-to-xyzw", Math3DVec4ToXYZW );


function Math3DXYZWToVec4() {
	this.addInputs([ [ "x", "number" ], [ "y", "number" ], [ "z", "number" ], [ "w", "number" ] ]);
	this.addOutput("vec4", "vec4");
	this.properties = { x:0, y:0, z:0, w:0 };
	this._data = new Float32Array( 4 );
}

Math3DXYZWToVec4.title = "XYZW->Vec4";
Math3DXYZWToVec4.desc = "components to vector4";

Math3DXYZWToVec4.prototype.onExecute = function() {
	var x = this.getInputData( 0 );
	if ( x == null ) {
		x = this.properties.x;
	}
	var y = this.getInputData( 1 );
	if ( y == null ) {
		y = this.properties.y;
	}
	var z = this.getInputData( 2 );
	if ( z == null ) {
		z = this.properties.z;
	}
	var w = this.getInputData( 3 );
	if ( w == null ) {
		w = this.properties.w;
	}

	var data = this._data;
	data[ 0 ] = x;
	data[ 1 ] = y;
	data[ 2 ] = z;
	data[ 3 ] = w;

	this.setOutputData( 0, data );
};

LiteGraph.registerNodeType("math3d/xyzw-to-vec4", Math3DXYZWToVec4 );




// if glMatrix is installed...
if ( window.glMatrix ) {
(function() {

	function Math3DRotation() {
		this.addInputs([ [ "degrees", "number" ], [ "axis", "vec3" ] ]);
		this.addOutput("quat", "quat");
		this.properties = { angle:90.0, axis: vec3.fromValues( 0, 1, 0 ) }; // eslint-disable-line no-undef
	}

	Math3DRotation.title = "Rotation";
	Math3DRotation.desc = "quaternion rotation";

	Math3DRotation.prototype.onExecute = function() {
		var angle = this.getInputData( 0 );
		if ( angle == null ) {
			angle = this.properties.angle;
		}
		var axis = this.getInputData( 1 );
		if ( axis == null ) {
			axis = this.properties.axis;
		}

		var R = quat.setAxisAngle( quat.create(), axis, angle * 0.0174532925 ); // eslint-disable-line no-undef
		this.setOutputData( 0, R );
	};


	LiteGraph.registerNodeType("math3d/rotation", Math3DRotation );


	// Math3D rotate vec3
	function Math3DRotateVec3() {
		this.addInputs([ [ "vec3", "vec3" ], [ "quat", "quat" ] ]);
		this.addOutput("result", "vec3");
		this.properties = { vec: [ 0, 0, 1 ] };
	}

	Math3DRotateVec3.title = "Rot. Vec3";
	Math3DRotateVec3.desc = "rotate a point";

	Math3DRotateVec3.prototype.onExecute = function() {
		var vec = this.getInputData( 0 );
		if ( vec == null ) {
			vec = this.properties.vec;
		}
		var quat = this.getInputData( 1 );
		if ( quat == null ) {
			this.setOutputData( vec );
		} else {
			this.setOutputData( 0, vec3.transformQuat( vec3.create(), vec, quat ) ); // eslint-disable-line no-undef
		}
	};

	LiteGraph.registerNodeType("math3d/rotateVec3", Math3DRotateVec3 );



	function Math3DMultQuat() {
		this.addInputs([ [ "A", "quat" ], [ "B", "quat" ] ]);
		this.addOutput( "A*B", "quat" );
	}

	Math3DMultQuat.title = "Mult. Quat";
	Math3DMultQuat.desc = "rotate quaternion";

	Math3DMultQuat.prototype.onExecute = function() {
		var A = this.getInputData( 0 );
		if ( A == null ) {
			return;
		}
		var B = this.getInputData( 1 );
		if ( B == null ) {
			return;
		}

		var R = quat.multiply( quat.create(), A, B ); // eslint-disable-line no-undef
		this.setOutputData( 0, R );
	};

	LiteGraph.registerNodeType("math3d/mult-quat", Math3DMultQuat );

})();
} // glMatrix

})();
