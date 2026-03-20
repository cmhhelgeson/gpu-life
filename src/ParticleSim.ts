export abstract class ParticleSim {

    device: GPUDevice;
    pipelines: Record<string, GPUComputePipeline>;
    buffers: Record<string, GPUBuffer>;
    bindGroups: Record<string, GPUBindGroup>;

    constructor(device: GPUDevice) {

        this.device = device;
        this.pipelines = {};
        this.buffers = {};
        this.bindGroups = {};

    }

    /* Attach a pipeline to the pipelines registry on the ParticleSim class */
    registerPipeline(name: string, pipeline: GPUComputePipeline): void {
        this.pipelines[name] = pipeline
    }

    registerBuffer(name: string, buffer: GPUBuffer) {
        this.buffers[name] = buffer;
    }

    registerBindgroup(name: string, bindGroup: GPUBindGroup) {
        this.bindGroups[name] = bindGroup;
    }


    /* Setup shaders and pipelines for shaders */
    /* abstract function */
    abstract setup(): void;

    abstract start(
        uniformBuffer: GPUBuffer,
        simBuffer: GPUBuffer,
        matrixBuffer: GPUBuffer,
        particleBuffers: [GPUBuffer, GPUBuffer],
        particleAmt: number,
        cellAmt: number,
    ): void;

    abstract tick(): void;

    /* Detach all references to relevant buffers and pipelines */
    destroy() {

        this.pipelines = {};
        this.buffers = {};

    }

}