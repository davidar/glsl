#include "shadertoy.frag"
uniform sampler2D iChannel0; //! buffer[xbuf: double-slit.xbuf1.frag, wrap: GL_CLAMP_TO_EDGE]
uniform sampler2D iChannel1; //! buffer[xbuf: double-slit.xbuf0.frag, wrap: GL_CLAMP_TO_EDGE]
#include "double-slit.frag"
