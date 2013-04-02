function assert(thing) {
    if (thing)
	print("pass ");
    else
	print("fail ");
}

function turtleTest () {
    var foo = new Turtle();
    foo.x;
    foo.fd(10);
    assert(foo.x == 10);
    foo.rt(90);
    foo.fd(10);
    assert(foo.x == 10);
    assert(foo.y == 10);
}
