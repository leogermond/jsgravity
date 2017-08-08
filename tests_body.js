function test_basic_movement(name, mass, forces, expected) {
    QUnit.test("basic movement: " + name, function(assert) {
        expected = math.matrix(expected);
        var b = new Body([0, 0], [0, 0], [0, 0], mass);
        
        var actual = undefined;
        for(var i = 0; i < math.size(forces)[0]; i++) {
            b.tick(forces[i]);
            if(actual === undefined) {
                actual = math.matrix([b.psa]);
            } else {
                actual = math.concat(actual, math.matrix([b.psa]), 0);
            }
        }
        assert.equal(actual.toString(), expected.toString());
        });
}

test_basic_movement("simple",
    1,
    [undefined, [0, 1], undefined, undefined],
    [[[0, 0], [0, 0], [0, 0]],
     [[0, 0], [0, 1], [0, 0]],
     [[0, 1], [0, 1], [0, 0]],
     [[0, 2], [0, 1], [0, 0]]]);

test_basic_movement("large weight",
    1000,
    [undefined, [0, 1000], undefined, undefined],
    [[[0, 0], [0, 0], [0, 0]],
     [[0, 0], [0, 1], [0, 0]],
     [[0, 1], [0, 1], [0, 0]],
     [[0, 2], [0, 1], [0, 0]]]);
     

test_basic_movement("weight",
    2,
    [undefined, [0, 4], undefined, undefined],
    [[[0, 0], [0, 0], [0, 0]],
     [[0, 0], [0, 2], [0, 0]],
     [[0, 2], [0, 2], [0, 0]],
     [[0, 4], [0, 2], [0, 0]]]);