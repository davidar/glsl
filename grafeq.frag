// 2016 David A Roberts <https://davidar.io>

// I loved playing with GrafEq as a kid, so here it is re-implemented in GLSL.

#include "shadertoy.h"

// Try changing the value of AA if you have trouble running the shader.
#define AA 4.
//#define AA 1.

#define PI 3.141592653589793

// CRT effects (curvature, vignette, scanlines and CRT grille)
// from <https://www.shadertoy.com/view/XtlSD7>
vec2 CRTCurveUV( vec2 uv ) {
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs( uv.yx ) / vec2( 6.0, 4.0 );
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
}
void DrawVignette( inout vec3 color, vec2 uv ) {    
    float vignette = uv.x * uv.y * ( 1.0 - uv.x ) * ( 1.0 - uv.y );
    vignette = clamp( pow( 16.0 * vignette, 0.3 ), 0.0, 1.0 );
    color *= vignette;
}
void DrawScanline( inout vec3 color, vec2 uv ) {
    float scanline      = clamp( 0.95 + 0.05 * cos( 3.14 * ( uv.y + 0.008 * iTime ) * 240.0 * 1.0 ), 0.0, 1.0 );
    float grille        = 0.85 + 0.15 * clamp( 1.5 * cos( 3.14 * uv.x * 640.0 * 1.0 ), 0.0, 1.0 );    
    color *= scanline * grille * 1.2;
}

float atanp(in vec2 p) { return atan(p.y,p.x); }
float cube_root(float x) { return sign(x) * pow(abs(x), 1./3.); }
float sq(float x) { return x*x; }

vec3 margarita(in vec2 p) {
    float z = length(p) - 3.5 * atanp(p) + sin(p.x) + cos(p.y);
    if(mod(z,7.*PI) < PI/2.) return vec3(1,0,0);
    if(mod(z,1.*PI) < PI/2.) return vec3(0);
    return vec3(1);
}

vec3 digital_bacteria(in vec2 p) {
    p /= 4.;
    float x = sq(sin(p.x)+p.y) + sq(cos(p.y)+p.x);
    float y = cos(10.*p.x) + cos(10.*p.y) - sin(p.x*p.y);
    float z = sq(sin(floor(p.x))+floor(p.y)) + sq(cos(floor(p.y))+floor(p.x));
    if(17. < x && x < 21. && 17. < z && z < 21. && y < 0.)
        return vec3(1.,1.,85./256.);
    if(17. < z && z < 21.) return vec3(85./256.,0.,0.);
    if(17. < x && x < 21.) return vec3(170./256.,170./256.,0.);
    return vec3(85./256.,85./256.,0.);
}

vec3 threesome(in vec2 p) {
    p /= 3.;
    float z = 1.;
    z *= sin(length(p + vec2(5,0))) * cos(8.*atanp(p + vec2(5,0)));
    z *= sin(length(p - vec2(5,5))) * cos(8.*atanp(p - vec2(5,5)));
    z *= sin(length(p + vec2(0,5))) * cos(8.*atanp(p + vec2(0,5)));
    if(-0.1 < z && z < 0. || 0.2 < z) return vec3(0);
    return vec3(1);
}

vec3 plaid_meltdown(in vec2 p) {
    p /= 15.;
    p += 7.;
    float a = 2.*sin(p.x*sin(p.y) + p.y*sin(p.x));
    float b = cube_root(sin(2.5*sqrt(2.) * (p.x - p.y)));
    float c = cube_root(sin(2.5*sqrt(2.) * (p.x + p.y)));
    float d = sin(80.*p.x) + sin(80.*p.y);
    if(0.25 * (a + b + c) > 0.5 * d) return vec3(0);
    return vec3(1);
}

vec3 sunlight_revealed(in vec2 p) {
    p /= 6.;
    p.x += 2.;
    float a = length(vec2(3.-p.x,p.y)) + abs(p.y) + abs(1.-p.x);
    float f = atan(p.y,p.x-1.);
    float c = atan(p.y,p.x-3.);
    float R = sq(p.x-1.) + sq(p.y);
    vec3 col = vec3(0);
    bool mix = false;
    if(5. < a && a < 7. && mod(f,PI/7.) < PI/14.) {
        col += vec3(0.,82./256.,173./256.);
        if(mix) col /= 2.;
        mix = true;
    }
    if(5. < a && a < 7. && mod(c,PI/9.) < PI/18.) {
        col += vec3(1,0,0);
        if(mix) col /= 2.;
        mix = true;
    }
    if(5. < a && a < 7. && mod(f,PI/8.) < PI/16.) {
        col += vec3(1,1,0);
        if(mix) col /= 2.;
        mix = true;
    }
    if((45.-3.*p.x)*PI/180. < f && f < (47.-p.x)*PI/180. && p.y > 0.1*p.x
       && mod(log(R)/log(f),2.) < 1.) {
        col += vec3(1);
        if(mix) col /= 2.;
    }
    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float t = mod(iTime,10.);
    vec3 color = vec3(0);
    for(float i = 0.; i < AA*AA - 0.5; i += 1.) {
        vec2 uv = (fragCoord.xy + vec2(floor(i/AA), mod(i,AA))/AA) / iResolution.xy;
        vec2 crtUV = CRTCurveUV( uv );
        if ( crtUV.x < 0.0 || crtUV.x > 1.0 || crtUV.y < 0.0 || crtUV.y > 1.0 ) continue;
        vec2 p = 50.0 * crtUV - 25.0;
        p *= 0.75 + 0.05*mod(iTime,10.);
        p += mod(iTime,10.) - 5.;
        p.x *= iResolution.x / iResolution.y;
        if(t < 2. || 8. < t) {
            float fade = smoothstep(0.,2.,t) - smoothstep(8.,10.,t);
            float scale = iResolution.y/50.*float(AA)*fade + 1.;
            p = floor(p.xy*scale)/scale;
        }

        vec3 c;
        if     (mod(0.1*iTime,5.) < 1.) c = margarita(p);
        else if(mod(0.1*iTime,5.) < 2.) c = plaid_meltdown(p);
        else if(mod(0.1*iTime,5.) < 3.) c = sunlight_revealed(p);
        else if(mod(0.1*iTime,5.) < 4.) c = threesome(p);
        else if(mod(0.1*iTime,5.) < 5.) c = digital_bacteria(p);

        DrawVignette( c, crtUV );
        DrawScanline( c, uv );
        color += c / float(AA*AA);
    }

    fragColor.xyz = color;
    fragColor.w = 1.0;
}
