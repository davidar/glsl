// 2016 David A Roberts <https://davidar.io>

// The classical double-slit experiment, demonstrating wave interference

#define PI 3.14159265358979
float sq(float x) { return x*x; }

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    if(iFrame < 10) { // wave packet
        fragColor.x = exp(-0.5 * sq(length(vec2(0,iResolution.y/2.) - fragCoord.xy)/15.)) * cos(fragCoord.x);
        return;
    }

    // barrier
    if(iResolution.x/2. - 5.  < fragCoord.x && fragCoord.x < iResolution.x/2. + 5. &&
        !(iResolution.y/2. - 15. < fragCoord.y && fragCoord.y < iResolution.y/2. - 5.) &&
        !(iResolution.y/2. + 5.  < fragCoord.y && fragCoord.y < iResolution.y/2. + 15.))
        return;

    vec2 q = fragCoord.xy/iResolution.xy;
    vec3 e = vec3(vec2(1)/iResolution.xy,0);

    float c = texture(iChannel0, q).x;
    float C = texture(iChannel1, q).x;
    float N = texture(iChannel1, q+e.zy).x;
    float E = texture(iChannel1, q+e.xz).x;
    float S = texture(iChannel1, q-e.zy).x;
    float W = texture(iChannel1, q-e.xz).x;

    // explicit approximation to the wave equation
    // <https://www.ibiblio.org/e-notes/webgl/gpu/flat_wave.htm>
    fragColor.x = 2.*C - c + (N + E + S + W - 4.*C) * 0.2;
}
