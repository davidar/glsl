/*!
 * <info>
 * <author>davidar [ https://www.shadertoy.com/user/davidar ]</author>
 * <name>Bumpy Earth</name>
 * 
 * <description>
 *   Click and drag to rotate.
 * </description>
 * 
 * <url>https://www.shadertoy.com/view/XsKBzt</url>
 * 
 * <date>2018-06-27</date>
 * 
 * <tags></tags>
 * 
 * <pass-name>Common</pass-name>
 * 
 * <synthclipse-importer-legal-note>
 *   As noted in: [ https://www.shadertoy.com/terms ]:
 *   If the author did not stated otherwise, this shader is licensed under
 *   Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License 
 *   [ http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US ].
 * </synthclipse-importer-legal-note>
 * </info>
 */

#ifdef SYNTHCLIPSE
uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iGlobalTime;          // shader playback time (in seconds) - <deprecated>
uniform float iTimeDelta;           // render time (in seconds)
uniform int iFrame;                 // shader playback frame
uniform float iChannelTime[4];      // channel playback time (in seconds)
uniform vec3 iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform vec4 iDate;                 // (year, month, day, time in seconds)
uniform float iSampleRate;          // sound sample rate (i.e., 44100)
uniform float iFrameRate;           // frames per second (effectively "1.0 / iTimeDelta")
#endif // SYNTHCLIPSE



// https://www.shadertoy.com/view/4tdSWr
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

vec2 hash( vec2 p ) {
        p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p ) {
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;
        vec2 i = floor(p + (p.x+p.y)*K1);
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
    vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0*K2;
    vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
        vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot(n, vec3(70.0));
}

float fbm(vec2 n) {
        float total = 0.0, amplitude = 0.1;
        for (int i = 0; i < 7; i++) {
                total += noise(n) * amplitude;
                n = m * n;
                amplitude *= 0.4;
        }
        return total;
}
