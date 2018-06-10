// 2018 David A Roberts <https://davidar.io>

// Inspired by https://imgur.com/gallery/WaEbi

#include "shadertoy.frag"
uniform sampler2D iChannel3; //! texture["Shadertoy/res/tex06.jpg"]
uniform sampler2D iChannel0; //! buffer[xbuf: basin.frag, wrap: GL_CLAMP_TO_EDGE]

#define buf(p) texture(iChannel0,(p)/iResolution.xy)

#define N  vec2( 0, 1)
#define NE vec2( 1, 1)
#define E  vec2( 1, 0)
#define SE vec2( 1,-1)
#define S  vec2( 0,-1)
#define SW vec2(-1,-1)
#define W  vec2(-1, 0)
#define NW vec2(-1, 1)

#define PI 3.14159265359

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

void mainImage( out vec4 r, in vec2 p ) {
    if (iFrame < 10 || iMouse.z > 0.) {
        r = vec4(0);
        r.r = texture(iChannel3, p / iResolution.xy).r + 9. * p.x/iResolution.x;
        return;
    }
    r = buf(p);
    
    // flow accumulation
    r.g = 1.;
    if (rec(p + N)  == -N)  r.g += buf(p + N).g;
    if (rec(p + NE) == -NE) r.g += buf(p + NE).g;
    if (rec(p + E)  == -E)  r.g += buf(p + E).g;
    if (rec(p + SE) == -SE) r.g += buf(p + SE).g;
    if (rec(p + S)  == -S)  r.g += buf(p + S).g;
    if (rec(p + SW) == -SW) r.g += buf(p + SW).g;
    if (rec(p + W)  == -W)  r.g += buf(p + W).g;
    if (rec(p + NW) == -NW) r.g += buf(p + NW).g;
    if (p.y < 2. || p.y > iResolution.y - 2.) r.g = 0.;
    
    // stream power
    vec4 receiver = buf(p + rec(p));
    float pslope = (r.r - receiver.r) / length(rec(p));
    r.r = max(r.r - 0.5 * pow(r.g, 0.8) * pow(pslope, 2.), receiver.r);
    
    // tectonic uplift
    r.r += 0.005 * p.x/iResolution.x;
    r.r += 0.005 * (0.5 + (abs(mod(iTime/5., 4.) - 2.) - 1.) * (p.y/iResolution.y - 0.5));
    
    // basin colouring
    r.b = (p.x < 10.) ? p.y/iResolution.y : receiver.b;
}
