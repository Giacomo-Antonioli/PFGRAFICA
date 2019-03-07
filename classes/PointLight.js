

class PointLight extends AmbientLight
{
    constructor(position, color)
    {
        super(color);
        this.has_position=true;
        this.position = glMatrix.vec3.fromValues(position[0], position[1], position[2]);
    }
}