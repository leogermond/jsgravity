// This file depends on math.js

function Body(p, s, a, m) {
	this.psa = math.matrix([ p, s, a ]);
	this.m = m;
	
	this.tick = function(f, t) {
        if(f === undefined) {
			f = [0, 0];
		}

        if(t === undefined) {
            t = 1;
        }

		this.psa = math.multiply([[ 1, t, 0.5*t*t, 0.5*t*t ],
								  [ 0, 1, t, t ],
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
    
    this.gravitation = function(t) {
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
                    var gfij = math.multiply(this.G * (b[0].m * b[1].m) / (d*d*d), sub);
                    gf[i] = math.add(gf[i], gfij);
                    gf[j] = math.add(gf[j], math.unaryMinus(gfij));
                }
            }
        }

        return gf;
    };

    this.tick = function(t) {
        if(t === undefined) {
            t = 1e-3;
        }

        var gf = this.gravitation(t);
        var nb_bodies = this.bodies.length;
        var islow = 1;
        for(var i = 0; i < nb_bodies; i++) {
            if(math.norm(gf[i]) > this.bodies[i].m*1000) {
                islow = math.norm(gf[i])/(this.bodies[i].m*1000);
            }
        }

        console.log(islow);

        for(var j = 0; j < islow; j++) {
            var tslow = t / islow;
            if(tslow != t) {
                gf = this.gravitation(tslow);
            }

            for(var i = 0; i < nb_bodies; i++) {
                this.bodies[i].tick(gf[i], tslow);
            }
        }
    };
    
    this.toString = function() {
        return "Universe({"+this.bodies.join(", ") + "})";
    };
}