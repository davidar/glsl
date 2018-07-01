#define y(p) (psi(p) + dt*k3(p))
#include "qm.frag"
void main() { gl_FragColor.xy = (iFrame < 10) ? psi0(gl_FragCoord.xy) : rk4(gl_FragCoord.xy); }
