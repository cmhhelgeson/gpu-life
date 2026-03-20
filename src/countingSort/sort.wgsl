struct SortParticle {
    pos: vec2f,
    vel: vec2f,
    colour: f32,
    idx: vec2u
}

@group(0) @binding(0) var<storage, read> input: array<SortParticle>;
@group(0) @binding(1) var<storage, read_write> output: array<SortParticle>;

@group(0) @binding(2) var<storage, read_write> offsets: array<atomic<u32>>;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if (global_id.x >= arrayLength(&input)) {
        return;
    }
    let value = input[global_id.x];
    let targetIndex = atomicAdd(&offsets[value.idx.x], 1u);
    output[targetIndex] = value;
}