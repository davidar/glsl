// 2017 David A Roberts <https://davidar.io>

// Single-pass Navier-Stokes solver, ported from "Simple and Fast Fluids"
// https://hal.inria.fr/inria-00596050

#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: fluid.frag]

#include "3d-simplex-noise.frag"

vec2 pen(float t) {
    t *= 0.05;
    return 0.5 * iResolution.xy *
        vec2(simplex3d(vec3(t,0,0)) + 1.,
             simplex3d(vec3(0,t,0)) + 1.);
}

#define T(p) texture(iChannel0,(p)/iResolution.xy)
#define length2(p) dot(p,p)

#define dt 0.15
#define K 0.2
#define nu 0.5
#define kappa 0.1

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
    
    // semi-Langrangian advection
    c.xyw = T(p - dt*c.xy).xyw;
    
    // viscosity/diffusion
    c.xyw += dt * vec3(nu,nu,kappa) * laplacian.xyw;
    
    // nullify divergence with pressure field gradient
    c.xy -= K * vec2(dx.z,dy.z);
    
    // external source
    vec2 m = pen(iTime);
    c.xyw += dt * exp(-length2(p - m)/50.) * vec3(m - pen(iTime-0.1), 1);
    
    // dissipation
    c.w -= dt*0.0005;
    
    c.xyzw = clamp(c.xyzw, vec4(-5,-5,0.5,0), vec4(5,5,3,5));
}
