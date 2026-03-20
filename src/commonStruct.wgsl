struct Uniforms {
    aspect: f32,
    mouse: vec4<f32>,
    size: f32
}

struct Sim {
    colours: f32,
    beta: f32,
    rMax: f32,
    force: f32,
    friction: f32,
    dt: f32,
    cellSize: f32,
    cellAmt: f32,
    avoidance: f32,
    worldSize: f32,
    border: f32,
    vortex: f32,
}

struct Particle {
    pos: vec2f,
    vel: vec2f,
    colour: f32,
}
