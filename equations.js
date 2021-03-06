// This file depends on math.js and lodash.js

var g_log = false;

function log(m) {
    if (g_log) {
        console.log(m);
    }
}

function Body(p, s, a, m) {
	this.psa = math.matrix([ p, s, a ]);
    this.m = m;

    this.getPSA = function(dim) {
        return this.psa.toArray()[dim];
    };

    this.getP = function() {
        return this.getPSA(0);
    };

    this.getS = function() {
        return this.getPSA(1);
    };

    this.limitS = function(max_norm) {
        var s_norm = math.norm(this.getS());
        if (s_norm > max_norm) {
            var factor = max_norm / s_norm;
            this.psa = math.multiply([[1, 0, 0],
                                      [0, factor, 0],
                                      [0, 0, 1]], this.psa);
        }
    };

    this.getA = function() {
        return this.getPSA(2);
    };

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

    this.copy = function() {
        return Body(this.getP(), this.getS(), this.getA(), this.m);
    }
}

function collisionReduceP(b1, b2) {
    if (math.norm(math.add(b1.getP(), math.unaryMinus(b2.getP()))) < 10) {
        if (_.has(b1, 'hasCollided')) {
            b1.hasCollided(b2);
        }

        if (_.has(b2, 'hasCollided')) {
            b2.hasCollided(b1);
        }

        var larger, smaller;
        if (b1.m >= b2.m) {
            larger = b1;
            smaller = b2;
        } else {
            larger = b2;
            smaller = b1;
        }

        larger.m += smaller.m;
        smaller.m = 0;
        larger.psa = math.add(larger.psa,
            math.multiply([[0, 0, 0],
                           [0, smaller.m / larger.m, 0],
                           [0, 0, 0]], smaller.psa));
        smaller.psa = larger.psa;
    }
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
                var sub = math.subtract(b[1].getP(), b[0].getP());
                var d = math.norm(sub);
                // handle collision
                if(d != 0 && 1e10 * d < b[0].m * b[1].m) {
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

        var nb_bodies = this.bodies.length;
        var gf = this.gravitation(t);
        var islow = 1;
        for(var i = 0; i < nb_bodies; i++) {
            var b = this.bodies[i];
            var v = math.max(math.norm(b.getS()), 1e3);
            islow = math.max(islow, math.floor(t * 1e4 * math.norm(gf[i]) / (b.m * v)));
        }

        islow = math.min(1e3, islow);
        if(islow != 1) {
            log(islow);
        }

        for(var j = 0; j < islow; j++) {
            var tslow = t / islow;

            if(tslow != t) {
                gf = this.gravitation(tslow);
            }

            _.forEach(this.bodies, function(b1) {
                b1.limitS(1e10);
                _.forEach(this.bodies, function(b2) {
                    collisionReduceP(b1, b2);
                });
            });

            this.bodies = _.filter(this.bodies, 'm');

            var i = 0;
            _.forEach(this.bodies, function(b) {
                b.tick(gf[i], tslow);
                i++;
            });
        }
    };

    this.toString = function() {
        return "Universe({"+this.bodies.join(", ") + "})";
    };
}
