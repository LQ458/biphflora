// CRA loads this file before tests. Keep it dependency-free until a compatible
// testing-library package is deliberately introduced and locked.
const testGlobal = typeof window === "undefined" ? global : window;

testGlobal.IS_REACT_ACT_ENVIRONMENT = true;
