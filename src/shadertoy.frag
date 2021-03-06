#ifdef GL_ES
//[
precision mediump float;
//]
#endif

#ifndef GLSLVIEWER
#ifndef SYNTHCLIPSE_ONLY
layout(location = 0) out vec4 glFragColor;
#define gl_FragColor glFragColor
#endif

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

//[
#ifndef NO_MAIN
void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}
#endif
//]
#endif

#ifdef GLSLVIEWER
#define iTime iGlobalTime
#define iFrame int(iGlobalTime/iTimeDelta)
#define iChannel0 u_backbuffer
uniform sampler2D u_backbuffer;
#endif
