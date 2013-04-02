// Amazingly this works (on Chrome, haven't tested it elsewhere)
function klone(obj) {
  nobj = new Object();
  nobj.__proto__ = obj;
  return nobj;
}
