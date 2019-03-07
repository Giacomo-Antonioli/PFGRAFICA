

class DirectionalLight extends AmbientLight
{
    constructor(direction, color)
    {
        super(color);
        this.has_position=false;
        this.direction = glMatrix.vec3.fromValues(direction[0], direction[1], direction[2]);
    }
}
