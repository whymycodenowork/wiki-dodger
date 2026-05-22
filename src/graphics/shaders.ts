
// src/graphics/shaders.ts

export const VERT_SRC = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUV;
layout(location = 2) in vec4 aColor;
layout(location = 3) in float aZ;

out vec2 vUV;
out vec4 vColor;

uniform mat4 uProjection;

void main() {
    gl_Position = uProjection * vec4(aPos, aZ, 1.0);
    vUV = aUV;
    vColor = aColor;
}
`;

export const FRAG_SRC = `#version 300 es
precision mediump float;

in vec2 vUV;
in vec4 vColor;

uniform sampler2D uTexture;

out vec4 fragColor;

void main() {
    vec4 tex = texture(uTexture, vUV) * vColor;
    if (tex.a <= 0.001) discard;
    fragColor = tex;
}
`;
