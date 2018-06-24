// 2018 David A Roberts <https://davidar.io>

// Click the left side to reset, or the right side to show tectonic plates.

#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: tectonics-erosion.frag]

#include "fbm.frag"
#include "hash.frag"

#define OCEAN_DEPTH 7.5

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

// plate movement
vec2 move(float q) {
    vec2 v = vec2(cos(2.*PI*q), sin(2.*PI*q));
    if (hash13(vec3(v,iFrame)) < 0.05) {
        if (hash13(vec3(v+1.,iFrame)) < abs(v.x) / (abs(v.x) + abs(v.y))) {
            return vec2(sign(v.x),0.);
        } else {
            return vec2(0.,sign(v.y));
        }
    }
    return vec2(0);
}

float slope(vec2 p, vec2 q) {
    if (p == q) return 0.;
    return (buf(q).z - buf(p).z) / distance(p,q);
}

vec2 rec(vec2 p) { // direction of water flow at point
    vec2 d = vec2(0);
    if (slope(p + N,  p) >= slope(p + d, p)) d = N;
    if (slope(p + NE, p) >= slope(p + d, p)) d = NE;
    if (slope(p + E,  p) >= slope(p + d, p)) d = E;
    if (slope(p + SE, p) >= slope(p + d, p)) d = SE;
    if (slope(p + S,  p) >= slope(p + d, p)) d = S;
    if (slope(p + SW, p) >= slope(p + d, p)) d = SW;
    if (slope(p + W,  p) >= slope(p + d, p)) d = W;
    if (slope(p + NW, p) >= slope(p + d, p)) d = NW;
    return d;
}

void mainImage(out vec4 c, in vec2 p) {
    if(iFrame < 10 || (iMouse.z > 0. && iMouse.x/iResolution.x < 0.5)) {
        c = vec4(0);
        c.x = -1.;
        c.z = 15. * clamp(5. * fbm(3. * p / iResolution.xy) + 0.5, 0., 1.);
        return;
    }
    
    c = buf(p);
    vec4 n = buf(p + N);
    vec4 e = buf(p + E);
    vec4 s = buf(p + S);
    vec4 w = buf(p + W);
    
    // diffuse uplift through plate
    float dy = 0.;
    if (e.x == c.x) dy += e.y - c.y;
    if (w.x == c.x) dy += w.y - c.y;
    if (n.x == c.x) dy += n.y - c.y;
    if (s.x == c.x) dy += s.y - c.y;
    c.y = max(0., c.y + 0.1 * dy);
    
    // tectonic uplift
    c.z += 2. * clamp(c.y - 0.5, 0., 1.);
    
    if (c.z >= OCEAN_DEPTH - 0.01) {
        // thermal erosion
        float dz = 0.;
        if (abs(e.z - c.z) > 1.) dz += e.z - c.z;
        if (abs(w.z - c.z) > 1.) dz += w.z - c.z;
        if (abs(n.z - c.z) > 1.) dz += n.z - c.z;
        if (abs(s.z - c.z) > 1.) dz += s.z - c.z;
        c.z = max(0., c.z + 0.02 * dz);

        // flow accumulation
        c.w = 1.;
        if (rec(p + N)  == -N)  c.w += buf(p + N).w;
        if (rec(p + NE) == -NE) c.w += buf(p + NE).w;
        if (rec(p + E)  == -E)  c.w += buf(p + E).w;
        if (rec(p + SE) == -SE) c.w += buf(p + SE).w;
        if (rec(p + S)  == -S)  c.w += buf(p + S).w;
        if (rec(p + SW) == -SW) c.w += buf(p + SW).w;
        if (rec(p + W)  == -W)  c.w += buf(p + W).w;
        if (rec(p + NW) == -NW) c.w += buf(p + NW).w;

        if (rec(p) == vec2(0)) { // local minima
            c.z += 0.001; // extra sediment
        } else {
            // hydraulic erosion with stream power law
            vec4 receiver = buf(p + rec(p));
            float pslope = (c.z - receiver.z) / length(rec(p));
            float dz = min(pow(c.w, 0.8) * pow(pslope, 2.), c.z);
            c.z = max(c.z - 0.05 * dz, receiver.z);
        }
    }
	
    // approximation of sediment accumulation
    c.z += 0.0002 * clamp(c.z + 2.5, 0., 10.);
    
    bool subduct = false;
    
    if(iFrame % 3000 < 10) {
        // generate new plate boundaries
        c.x = -1.;
    } else if(c.x < 0.) { // no plate under this point yet
        if(length(hash33(vec3(p,iFrame))) < 7e-3) {
            // seed a new plate with random velocity
            c.x = hash13(vec3(p,iFrame));
        } else {
            // accretion
            int dir = int(4.*hash13(vec3(p,iFrame)));
            if(dir == 0) c.x = s.x;
            if(dir == 1) c.x = w.x;
            if(dir == 2) c.x = n.x;
            if(dir == 3) c.x = e.x;
        }
    } else if (move(n.x) == S) {
        if (move(c.x) != S) subduct = true;
        c = n;
    } else if (move(e.x) == W) {
        if (move(c.x) != W) subduct = true;
        c = e;
    } else if (move(s.x) == N) {
        if (move(c.x) != N) subduct = true;
        c = s;
    } else if (move(w.x) == E) {
        if (move(c.x) != E) subduct = true;
        c = w;
    } else if (move(c.x) != vec2(0) && buf(p - move(c.x)).x >= 0.) {
        // rift
        c.x = -1.;
        if (c.z < OCEAN_DEPTH) {
            c.y = 0.;
            c.z = 0.;
        }
        c.w = 0.;
    }
    
    if (subduct) {
        c.y = 1.;
    } else {
        c.y = clamp(c.y - 0.0001, 0., 1.);
    }
}
