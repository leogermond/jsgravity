// This file depends on math.js

function Body(p, s, a, m) {
	this.psa = math.matrix([ p, s, a ]);
	this.m = m;
	
	this.tick = function(f) {
		
        if(f === undefined) {
			f = [0, 0];
		}
		this.psa = math.multiply([[ 1, 1, 0, 0 ],
								  [ 0, 1, 1, 1 ],
								  [ 0, 0, 1, 0 ]],
								  math.concat(
									this.psa,
									math.divide([f], this.m),
									0));
	};
	
	this.toString  = function() {
		return "Body(" + this.psa.toString().slice(1, -1) + ", " + this.m + ")";
	};
}

function Universe(bodies, G) {
    if(bodies === undefined) {
        bodies = [];
    }
    this.bodies = bodies;
    
    if(G === undefined) {
        G = 6.67e-11;
    }
    this.G = G;
    
    this.forEachBody = function(fn) {
        math.forEach(this.bodies, fn);
    };
    
    this.tick = function() {
        var nb_bodies = this.bodies.length;
        
        var gf = [];
        
        for(var i = 0; i < nb_bodies; i++) {
            gf.push(0);
        }
        
        for(var i = 0; i < nb_bodies; i++) {    
            for(var j = i + 1; j < nb_bodies; j++) {
                var b = [this.bodies[i], this.bodies[j]];
                var sub = math.subtract(math.multiply([1, 0, 0], b[1].psa),
                                        math.multiply([1, 0, 0], b[0].psa));
                var d = math.norm(sub);
                // handle collision
                if(d != 0) {
                    var gfij = math.divide(math.multiply(this.G * (b[0].m * b[1].m) / (d*d), sub), d);
                    gf[i] = math.add(gf[i], gfij);
                    gf[j] = math.add(gf[j], math.unaryMinus(gfij));
                }
            }
        }

        for(var i = 0; i < nb_bodies; i++) {
            this.bodies[i].tick(gf[i]);
        }
    };
    
    this.toString = function() {
        return "Universe({"+this.bodies.join(", ") + "})";
    };
}