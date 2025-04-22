// import { p } from "./TrainedBird"
import { p, pipeImage } from "./main"

export class Pipe {
    x: number
    y_top: number
    velocity: number = 2
    gap: number = 150
    width: number = 40
    color: string = "green"
    passed: boolean = false


    constructor() {
        this.x = p.width;
        this.y_top = p.random(50, p.height - this.gap - 50)

    }

    update = () => {
        this.x -= this.velocity
        // this.draw();
    }

    draw = () => {
        p.push()
        p.fill(255, 0, 0, 100)
        p.noStroke()
        p.image(pipeImage, this.x - 10, this.y_top + this.gap, this.width + 20, p.height - this.y_top - this.gap)
        // p.rect(this.x, this.y_top + this.gap, this.width, p.height - this.y_top - this.gap)
        // p.rect(this.x, 0, this.width, this.y_top )
        p.scale(1, -1)
        p.image(pipeImage, this.x - 10, -this.y_top, this.width + 20, this.y_top)
        p.pop()
    }
}