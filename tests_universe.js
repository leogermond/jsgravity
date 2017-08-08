QUnit.test("universe: gravity", function(assert) {
    var u = new Universe(undefined, 1);
    
    u.bodies.push(new Body([0, 0], [0, 0], [0, 0], 1));
    u.bodies.push(new Body([2, 0], [0, 0], [0, 0], 16));
    
    u.tick();
    assert.equal(u.bodies[0].psa.toString(), "[[0, 0], [4, 0], [0, 0]]");
    assert.equal(u.bodies[1].psa.toString(), "[[2, 0], [-0.25, 0], [0, 0]]");
});

QUnit.test("universe: 3 bodies gravity", function(assert) {
    var u = new Universe(undefined, 1);
    
    u.bodies.push(new Body([0, 0], [0, 0], [0, 0], 1));
    u.bodies.push(new Body([2, 0], [0, 0], [0, 0], 16));
    u.bodies.push(new Body([3, 4], [0, 0], [0, 0], 50));
    
    u.tick();
    assert.equal(u.bodies[0].psa.toString(), "[[0, 0], [5.2, 1.6], [0, 0]]");
});