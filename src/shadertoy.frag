#ifdef SYNTHCLIPSE_ONLY
uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;
uniform vec4 iMouse;

void mainImage(out vec4, in vec2);

void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}
#else
#define iTime iGlobalTime
#define iFrame int(iGlobalTime/iTimeDelta)
#define iChannel0 u_backbuffer
uniform sampler2D u_backbuffer;
#endif
