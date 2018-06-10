// 2017 David A Roberts <https://davidar.io>

// Plants vs Herbivores simulation, with edibility determined by colour similarity:
// http://robust.cs.unm.edu/doku.php?id=ulam:demos:coevolution

#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: huegene.frag]

#include "hash.frag"

#define MAX_HEALTH 100.0
#define HEALTH(o) (-(o).w)
#define HERBIVORE(o) ((o).w < 0.)
#define PLANT(o) ((o).w > 0.)

vec4 lookup(vec2 p) {
    vec4 c = texture(iChannel0, p / iResolution.xy);
    c.w = c.w * (MAX_HEALTH + 10.) - MAX_HEALTH;
    if(-1. < c.w && c.w < 1.) c = vec4(0); // fix rounding errors
    return c;
}

// move herbivore from o to c at location p
vec4 move(vec4 o, vec4 c, vec2 p) {
    if(PLANT(c)) {
        // try to eat plant
        float sad = abs(c.x-o.x) + abs(c.y-o.y) + abs(c.z-o.z);
        if(sad < 0.2 /* || hash13(vec3(p,iFrame)) < 0.2/sad */ )
            // plant is edible, increase health
            o.w = clamp(o.w - 6.*c.w, -MAX_HEALTH, 0.);
    }
    if(PLANT(c) || HEALTH(o) > HEALTH(c)) {
        // move unless already occupied by healthier herbivore
        c = o;
        // transfer some health to offspring
        //if(HEALTH(c) >= MAX_HEALTH-1.) c.w /= 2.;
    }
    return c;
}

void mainImage(out vec4 c, in vec2 p) {
    // biogenesis of the mother tree
    if(iFrame < 10 || iMouse.z > 0.) {
        c = vec4(0);
        if(length(p-0.5*iResolution.xy) < 2.) {
            c.xyz = hash33(vec3(p,iFrame));
            c.w = 10.;
        }
    	c.w = (MAX_HEALTH + c.w) / (MAX_HEALTH + 10.); // scale to [0,1]
        return;
    }
    
    // randomly spawn herbivores
    if(hash13(vec3(p,iFrame)) == 0. && int(p.x)%10==0 && int(p.y)%10==0) {
        c = vec4(0);
        c.xyz = hash33(vec3(p,iFrame));
        c.w = -MAX_HEALTH/2.;
    	c.w = (MAX_HEALTH + c.w) / (MAX_HEALTH + 10.); // scale to [0,1]
        return;
    }
    
    c = lookup(p);
    
    vec4 n = lookup(p + vec2( 0, 1));
    vec4 e = lookup(p + vec2( 1, 0));
    vec4 s = lookup(p + vec2( 0,-1));
    vec4 w = lookup(p + vec2(-1, 0));
    
    // which neighbour this cell wants to move to this turn
    int dir = int(4.*hash13(vec3(p,iFrame)));
    vec4 tgt;
    if(dir == 0) tgt = s;
    if(dir == 1) tgt = w;
    if(dir == 2) tgt = n;
    if(dir == 3) tgt = e;
    
    // are neighbouring cells wanting to move here?
    bool nc = int(4.*hash13(vec3(p + vec2( 0, 1), iFrame))) == 0;
    bool ec = int(4.*hash13(vec3(p + vec2( 1, 0), iFrame))) == 1;
    bool sc = int(4.*hash13(vec3(p + vec2( 0,-1), iFrame))) == 2;
    bool wc = int(4.*hash13(vec3(p + vec2(-1, 0), iFrame))) == 3;
    
    // move herbivore from neighbouring cell here
    if     (nc && HERBIVORE(n)) c = move(n,c,p);
    else if(ec && HERBIVORE(e)) c = move(e,c,p);
    else if(sc && HERBIVORE(s)) c = move(s,c,p);
    else if(wc && HERBIVORE(w)) c = move(w,c,p);
    else if(HERBIVORE(c)) {
        if(HEALTH(c) >= MAX_HEALTH-1.) {
            // leave behind an offspring
            c.xyz += (hash33(vec3(p,iFrame))-0.5)/10.; // mutation
            c.w /= 2.;
        } else if(HEALTH(c) > HEALTH(tgt)) {
            // move away unless neighbour is healthier
            c = vec4(0);
        }
    }
    
    // send seed to neighbouring empty land
    if(c.w > 9.5 && tgt.w == 0.) c.w = 5.;
    
    if(c.w == 0.) { // empty land here
        vec4 par = vec4(0);
        if(nc && n.w > 9.5) par = n;
        if(ec && e.w > 9.5) par = e;
        if(sc && s.w > 9.5) par = s;
        if(wc && w.w > 9.5) par = w;
        if(par.w > 9.5) {
            // plant seed here
            c.xyz = par.xyz + (hash33(vec3(p,iFrame))-0.5)/16.; // mutation
            c.w = 5.;
        }
    }
    
    // each turn herbivores expend health, plants grow
    if(c.w != 0.) c.w += 1.;
    
    c.xyz = clamp(c.xyz, 0., 1.);
    c.w = clamp(c.w, -MAX_HEALTH, 10.);
    c.w = (MAX_HEALTH + c.w) / (MAX_HEALTH + 10.); // scale to [0,1]
}
