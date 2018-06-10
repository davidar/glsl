// 2018 David A Roberts <https://davidar.io>

// Landscape evolution model (fluvial incision and tectonic uplift) using the stream
// power law, loosely based on https://arxiv.org/abs/1803.02977

// Let it run for a few minutes for the rivers to grow

#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: erosion.frag, wrap: GL_CLAMP_TO_EDGE]

#include "fbm.frag"

#define buf(p) texture(iChannel0,(p)/iResolution.xy)

#define N  vec2( 0, 1)
#define NE vec2( 1, 1)
#define E  vec2( 1, 0)
#define SE vec2( 1,-1)
#define S  vec2( 0,-1)
#define SW vec2(-1,-1)
#define W  vec2(-1, 0)
#define NW vec2(-1, 1)

float slope(vec2 p, vec2 q) {
    return (buf(q).r - buf(p).r) / distance(p,q);
}

vec2 rec(vec2 p) { // direction of water flow at point
    vec2 d = N;
    if (slope(p + NE, p) > slope(p + d, p)) d = NE;
    if (slope(p + E,  p) > slope(p + d, p)) d = E;
    if (slope(p + SE, p) > slope(p + d, p)) d = SE;
    if (slope(p + S,  p) > slope(p + d, p)) d = S;
    if (slope(p + SW, p) > slope(p + d, p)) d = SW;
    if (slope(p + W,  p) > slope(p + d, p)) d = W;
    if (slope(p + NW, p) > slope(p + d, p)) d = NW;
    return d;
}

bool eq(vec2 p, vec2 q) {
    return distance(p,q) < 1e-3;
}

void mainImage( out vec4 r, in vec2 p ) {
    if (iFrame < 10 || iMouse.z > 0.) {
        r.r = clamp(5. * fbm(3. * p / iResolution.xy) + 0.5, 0., 1.);
        return;
    }
    r = buf(p);
    
    // flow accumulation
    r.g = 1.;
    if (eq(rec(p + N),  -N))  r.g += buf(p + N).g;
    if (eq(rec(p + NE), -NE)) r.g += buf(p + NE).g;
    if (eq(rec(p + E),  -E))  r.g += buf(p + E).g;
    if (eq(rec(p + SE), -SE)) r.g += buf(p + SE).g;
    if (eq(rec(p + S),  -S))  r.g += buf(p + S).g;
    if (eq(rec(p + SW), -SW)) r.g += buf(p + SW).g;
    if (eq(rec(p + W),  -W))  r.g += buf(p + W).g;
    if (eq(rec(p + NW), -NW)) r.g += buf(p + NW).g;
    
    // stream power
    vec4 receiver = buf(p + rec(p));
    float pslope = (r.r - receiver.r) / length(rec(p));
    r.r = max(r.r - 0.05 * pow(r.g, 0.8) * pow(pslope, 2.), receiver.r);
    
    // tectonic uplift
    r.r += 0.0004 * p.x/iResolution.x;
}
