// 2018 David A Roberts <https://davidar.io>

// Extension of fluid.frag with vorticity confinement and MacCormack advection:
// http://physbam.stanford.edu/~fedkiw/papers/stanford2001-01.pdf
// http://physbam.stanford.edu/~fedkiw/papers/stanford2006-09.pdf

#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: vorticity.frag]

#include "3d-simplex-noise.frag"

vec2 pen(float t) {
    t *= 0.1;
    return 5. * 0.5 * iResolution.xy *
        vec2(simplex3d(vec3(t,0,0)) + 1.,
             simplex3d(vec3(0,t,0)) + 1.);
}

#define T(p) texture(iChannel0,(p)/iResolution.xy)

#define dt 0.15
#define K 0.1
#define nu 0.25
#define kappa 0.1

float vorticity(vec2 p) {
    vec4 n = T(p + vec2(0,1));
    vec4 e = T(p + vec2(1,0));
    vec4 s = T(p - vec2(0,1));
    vec4 w = T(p - vec2(1,0));
    vec4 dx = (e - w)/2.;
    vec4 dy = (n - s)/2.;
    return dx.y - dy.x;
}

float screendist2(vec2 p, vec2 q) {
    vec2 r = mod(p - q + iResolution.xy/2., iResolution.xy) - iResolution.xy/2.;
    return dot(r,r);
}

void mainImage(out vec4 c, in vec2 p) {
    if(iFrame < 10) {
        c = vec4(0,0,1,0);
        return;
    }
    
    c = T(p);
    
    vec4 n = T(p + vec2(0,1));
    vec4 e = T(p + vec2(1,0));
    vec4 s = T(p - vec2(0,1));
    vec4 w = T(p - vec2(1,0));
    
    vec4 laplacian = (n + e + s + w - 4.*c);
    
    vec4 dx = (e - w)/2.;
    vec4 dy = (n - s)/2.;
    
    // velocity field divergence
    float div = dx.x + dy.y;
    
    // mass conservation, Euler method step
    c.z -= dt*(dx.z * c.x + dy.z * c.y + div * c.z);
    
    // MacCormack advection
    vec2 q = p - dt*c.xy;
    vec2 r = q + dt*T(q).xy;
    c.xyw = T(q + (p - r)/2.).xyw;
    
    // semi-Langrangian advection
    //c.xyw = T(q).xyw;
    
    // viscosity/diffusion
    c.xyw += dt * vec3(nu,nu,kappa) * laplacian.xyw;
    
    // nullify divergence with pressure field gradient
    c.xy -= K * vec2(dx.z,dy.z);
    
    // external source
    vec2 m = pen(iTime);
    vec2 m0 = pen(iTime-0.015);
    float smoke = 100. * iTimeDelta * length(m - m0);
    c.xyw += dt * exp(-screendist2(p,m)/200.) * vec3(m - m0, smoke);
    
    // vorticity gradient
    vec2 eta = vec2(vorticity(p + vec2(1,0)) - vorticity(p - vec2(1,0)),
                    vorticity(p + vec2(0,1)) - vorticity(p - vec2(0,1)))/2.;
    if(length(eta) > 0.)
        c.xy += dt * 3. * vorticity(p) * normalize(eta);
    
    // dissipation
    c.w -= dt * 0.1 * iTimeDelta;
    
    c.xyzw = clamp(c.xyzw, vec4(-5,-5,0.5,0), vec4(5,5,3,1));
}
