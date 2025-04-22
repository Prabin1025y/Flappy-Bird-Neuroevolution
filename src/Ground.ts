import { groundIMage, p } from "./main"
// import { p } from "./TrainedBird"

export default class Ground {
    x: number
    y: number
    velocity: number = 2
    width: number = 574
    height: number = 30

    constructor(x: number) {
        this.x = x
        this.y = p.height - 30
    }

    update = () => {
        this.x -= this.velocity

        if (this.x < -this.width)
            this.x += 3 * this.width

    }

    draw = () => {
        p.push()
        p.image(groundIMage, this.x, this.y, this.width, this.height)
        p.pop()
    }
}