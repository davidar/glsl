#define y(p) (psi(p) + 0.5*dt*k1(p))
#include "qm.frag"
void main() { gl_FragColor.xy = k(gl_FragCoord.xy); }
