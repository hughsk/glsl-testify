precision mediump float;

// This test will pass.
bool test_pass() {
  return true;
}

// This test will fail.
bool test_fail() {
  return false;
}

// While this will be included, only functions starting
// with "test" will be tested.
vec3 another_thing() {
  return vec3(1.0);
}

// This is replaced automatically.
void main() {
  gl_FragColor = vec4(1.0);
}
