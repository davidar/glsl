// 2016 David A Roberts <https://davidar.io>

// Visualisation of the quantum wavefunction of a single particle, via numerical
// solution of the Schrodinger equation

#define NO_MAIN
#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: qm.xbuf0.frag, wrap: GL_CLAMP_TO_EDGE]
uniform sampler2D iChannel1; //! buffer[xbuf: qm.xbuf1.frag, wrap: GL_CLAMP_TO_EDGE]
uniform sampler2D iChannel2; //! buffer[xbuf: qm.xbuf2.frag, wrap: GL_CLAMP_TO_EDGE]
uniform sampler2D iChannel3; //! buffer[xbuf: qm.xbuf3.frag, wrap: GL_CLAMP_TO_EDGE]

#define psi(p) texture(iChannel0,(p)/iResolution.xy).xy
#define k1(p)  texture(iChannel1,(p)/iResolution.xy).xy
#define k2(p)  texture(iChannel2,(p)/iResolution.xy).xy
#define k3(p)  texture(iChannel3,(p)/iResolution.xy).xy

vec2 psi0(vec2 p) {
    vec2 o = vec2(iResolution.y/4.);
    p = (p - 0.5 * iResolution.xy) / iResolution.y;
    o = (o - 0.5 * iResolution.xy) / iResolution.y;
    float theta = 250. * (p.x + p.y);
    return exp(-70. * dot(p-o,p-o)) * vec2(cos(theta),sin(theta));
}

float potential(vec2 p) {
    return float(p.y < 5. || p.y > iResolution.y - 5. ||
        (p.x < 0.6*iResolution.x && int(p.y) == int(iResolution.y/2.)));
}

vec2 divi(vec2 c) { /* divide by sqrt(-1), ie. rotate 270 deg */
    return vec2(c.y, -c.x);
}

#define dt 0.25

#ifdef y
vec2 k(vec2 p) {
    vec2 c = y(p);
    vec2 n = y(p + vec2(0,1));
    vec2 e = y(p + vec2(1,0));
    vec2 s = y(p - vec2(0,1));
    vec2 w = y(p - vec2(1,0));
    vec2 laplacian = n + e + s + w - 4.*c;
    return divi(-laplacian + potential(p) * c);
}
#else
#define k
#endif

#define k4 k

#define rk4(p) (psi(p) + dt * (k1(p) + 2.*k2(p) + 2.*k3(p) + k4(p))/6.)
