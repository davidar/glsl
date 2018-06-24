// 2018 David A Roberts <https://davidar.io>

// Continental drift and mountain range formation simulation

#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: tectonics.frag]

#include "fbm.frag"
#include "hash.frag"

#define buf(p) texture(iChannel0,(p)/iResolution.xy)

#define N vec2( 0, 1)
#define E vec2( 1, 0)
#define S vec2( 0,-1)
#define W vec2(-1, 0)

// plate movement
vec2 move(vec2 v) {
    if (hash11(float(iFrame)) < 0.2 && hash13(vec3(v,iFrame)) < length(v)) {
        if (hash13(vec3(v,iFrame)) < abs(v.x) / (abs(v.x) + abs(v.y))) {
            return vec2(sign(v.x),0.);
        } else {
            return vec2(0.,sign(v.y));
        }
    }
    return vec2(0);
}

void mainImage(out vec4 c, in vec2 p) {
    if(iFrame < 10 || iMouse.z > 0.) {
        c = vec4(0);
        c.z = 15. * clamp(5. * fbm(3. * p / iResolution.xy) + 0.5, 0., 1.);
        return;
    }
    
    c = buf(p);
    vec4 n = buf(p + N);
    vec4 e = buf(p + E);
    vec4 s = buf(p + S);
    vec4 w = buf(p + W);
    
    // erosion
    c.z = max(0., c.z + 0.01 * (e.z + w.z + n.z + s.z - 4.*c.z));
    
    c.z += 0.0015;
    
    if(iFrame % 500 < 10) {
        // generate new plate boundaries
        c.xy = vec2(0);
    } else if(c.xy == vec2(0)) { // no plate under this point yet
        if(length(hash33(vec3(p,iFrame))) < 0.01) {
            // seed a new plate with random velocity
            c.xy = hash23(vec3(p,iFrame)) - 0.5;
        } else {
            // accretion
            int dir = int(4.*hash13(vec3(p,iFrame)));
            if(dir == 0) c.xy = s.xy;
            if(dir == 1) c.xy = w.xy;
            if(dir == 2) c.xy = n.xy;
            if(dir == 3) c.xy = e.xy;
        }
    } else if (move(n.xy) == S) {
        if (move(c.xy) != S) n.z += 1. + c.z; // subduction
        c = n;
    } else if (move(e.xy) == W) {
        if (move(c.xy) != W) e.z += 1. + c.z; // subduction
        c = e;
    } else if (move(s.xy) == N) {
        if (move(c.xy) != N) s.z += 1. + c.z; // subduction
        c = s;
    } else if (move(w.xy) == E) {
        if (move(c.xy) != E) w.z += 1. + c.z; // subduction
        c = w;
    } else if (move(c.xy) != vec2(0) && buf(p - move(c.xy)).xy != vec2(0)) {
        // rift
        c = vec4(0);
    }
}
