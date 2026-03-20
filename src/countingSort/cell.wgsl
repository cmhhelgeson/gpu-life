struct SortParticle {
    pos: vec2f,
    vel: vec2f,
    colour: f32,
    idx: vec2u
}

@group(0) @binding(0) var<uniform> sim: Sim;

@group(0) @binding(1) var<storage, read> input: array<Particle>;
@group(0) @binding(2) var<storage, read_write> output: array<SortParticle>;

@group(0) @binding(3) var<storage, read_write> counts: array<atomic<u32>>;

fn hash3i(k: vec3<i32>) -> u32 {
    let offset: u32 = 0x80000000u;
    var x: u32 = (u32(k.x) + offset) * 0x9E3779B1u;
    var y: u32 = (u32(k.y) + offset) * 0x85EBCA6Bu;
    var z: u32 = (u32(k.z) + offset) * 0xC2B2AE35u;

    var h: u32 = x ^ y ^ z;

    h ^= h >> 16u;
    h *= 0x7FEB352Du;
    h ^= h >> 15u;
    h *= 0x846CA68Bu;
    h ^= h >> 16u;

    return h;
}

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if (global_id.x >= arrayLength(&input)) {
        return;
    }

    var p  = input[global_id.x];

    let gridPos = vec2i(floor(p.pos / sim.cellSize));

    let cellHash = hash3i(vec3i(gridPos, 0)) % u32(sim.cellAmt);

    var op = SortParticle();
    op.idx = vec2u(cellHash, global_id.x);
    op.pos = p.pos;
    op.vel = p.vel;
    op.colour = p.colour;

    output[global_id.x] = op;

    atomicAdd(&counts[cellHash], 1u);
}