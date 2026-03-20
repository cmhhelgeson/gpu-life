import { ParticleSim } from '../ParticleSim';
import cellShader from './cell.wgsl?raw';
import prefixShader from './prefix.wgsl?raw';
import sortShader from './sort.wgsl?raw';
import simShader from './sim.wgsl?raw';
import commonStructShader from '../commonStruct.wgsl?raw';
import { setupTimestamp } from '../utils';

export class CountingSortSim extends ParticleSim {
  constructor(device: GPUDevice) {
    super(device);

    const s = 'test';
    console.log(s);
  }

  setup() {
    const nameModulePairings = [
      { code: commonStructShader + cellShader, pipelineName: 'cell' },
      { code: prefixShader, pipelineName: 'prefix' },
      { code: sortShader, pipelineName: 'sort' },
      { code: commonStructShader + simShader, pipelineName: 'countSim' },
    ];

    for (const { code, pipelineName } of nameModulePairings) {
      const module = this.device.createShaderModule({ code });
      setupTimestamp(this.device, pipelineName);

      this.pipelines[pipelineName] = this.device.createComputePipeline({
        layout: 'auto',
        compute: {
          module,
          entryPoint: 'main',
        },
      });
    }
  }

  start(
    uniformBuffer: GPUBuffer,
    simBuffer: GPUBuffer,
    matrixBuffer: GPUBuffer,
    particleBuffers: [GPUBuffer, GPUBuffer],
    particleAmt: number,
    cellAmt: number,
  ) {
    const weirdConstant =
      particleAmt *
      (8 * Float32Array.BYTES_PER_ELEMENT + 1 * Uint32Array.BYTES_PER_ELEMENT);

    this.buffers['cellBuffer'] = this.device.createBuffer({
      size: weirdConstant,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      label: 'cellBuffer',
    });

    this.buffers['sortedBuffer'] = this.device.createBuffer({
      size: weirdConstant,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      label: 'sortedBuffer',
    });

    this.buffers['countBuffer'] = this.device.createBuffer({
      size: cellAmt * Uint32Array.BYTES_PER_ELEMENT,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
      label: 'countBuffer',
    });

    this.buffers['indices'] = this.device.createBuffer({
      size: cellAmt * 2 * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      label: 'indicesBuffer',
    });

    this.buffers['zeroBuffer'] = this.device.createBuffer({
      size: cellAmt * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      label: 'zeroBuffer',
    });

    this.device.queue.writeBuffer(
      this.buffers['zeroBuffer'],
      0,
      new Uint32Array(cellAmt),
    );

    for (let i = 0; i < 2; i++) {
      this.bindGroups[`cell${i}`] = this.device.createBindGroup({
        layout: this.pipelines['cell'].getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: simBuffer,
            },
          },
          {
            binding: 1,
            resource: {
              buffer: particleBuffers[i],
            },
          },
          {
            binding: 2,
            resource: {
              buffer: this.buffers['cellBuffer'],
            },
          },
          {
            binding: 3,
            resource: {
              buffer: this.buffers['countBuffer'],
            },
          },
        ],
      });
    }

    this.bindGroups['prefix'] = this.device.createBindGroup({
      layout: this.pipelines['prefix'].getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.buffers['countBufer'],
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.buffers['indicesBuffer'],
          },
        },
      ],
    });

    this.bindGroups['sort'] = this.device.createBindGroup({
      layout: this.pipelines['sort'].getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.buffers['cellBuffer'],
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.buffers['sortedBuffer'],
          },
        },
        {
          binding: 2,
          resource: {
            buffer: this.buffers['countBuffer'],
          },
        },
      ],
    });

    for (let i = 0; i < 2; i++) {
      this.bindGroups[`sim${i}`] = this.device.createBindGroup({
        layout: this.pipelines['countSim'].getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer,
            },
          },
          {
            binding: 1,
            resource: {
              buffer: simBuffer,
            },
          },
          {
            binding: 2,
            resource: {
              buffer: matrixBuffer,
            },
          },
          {
            binding: 3,
            resource: {
              buffer: particleBuffers[i],
            },
          },
          {
            binding: 4,
            resource: {
              buffer: particleBuffers[1 - i],
            },
          },
          {
            binding: 5,
            resource: {
              buffer: this.buffers['sortedBuffer'],
            },
          },
          {
            binding: 6,
            resource: {
              buffer: this.buffers['indicesBuffer'],
            },
          },
        ],
      });
    }
  }

  tick() {
    console.log('yo');
  }
}
