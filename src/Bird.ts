import { birdImage, p } from "./main"
// import { p } from "./TrainedBird"
import { Pipe } from "./Pipe"

export default class Bird {
    x: number = 200
    y: number
    velocity: number
    flapping_force: number = 10
    gravity: number = 0.4
    fitness: number
    alive: boolean
    nextPipe: Pipe | null = null
    score: number

    brain: any

    constructor(passedBrain?: any) {
        //if brain is availabe, copy it otherwise create new
        if (passedBrain)
            this.brain = passedBrain.copy()
        else
            this.brain = ml5.neuralNetwork({
                inputs: 4,
                outputs: ['flap', 'no_flap'],
                task: "classification",
                neuroEvolution: true
            })

        this.y = p.height / 2
        this.velocity = 0
        this.fitness = 0
        this.alive = true
        this.score = 0

    }

    update = (pipes: Pipe[]) => {
        this.y += this.velocity;
        this.velocity += this.gravity;
        this.velocity *= 0.95

        this.fitness++;

        //die if ground is hit
        if (this.y > p.height - 30) {
            this.y = p.height - 10
            this.velocity = 0
            this.die()
        }

        //die if hit the ceiling
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0
            this.die()
        }

        this.checkPipe(pipes)
        this.think()

        // this.draw();
    }

    checkPipe = (pipes: Pipe[]) => {
        //calculate the the next incoming pipe
        for (const pipe of pipes) {
            if ((pipe.x + pipe.width) > this.x) {
                this.nextPipe = pipe
                pipe.color = "red"
                break;
            }
            pipe.color = "green"
        }

        for (const pipe of pipes) {
            if (!pipe.passed && (pipe.x + pipe.width) < this.x) {
                this.fitness += 100
                pipe.passed = true;
                this.score++;
                console.log("Cleared")
            }
        }

        //die if collided with any pipes
        if (this.nextPipe)
            if (this.y < this.nextPipe.y_top || this.y > this.nextPipe.y_top + this.nextPipe.gap)
                if (this.x > this.nextPipe.x && this.x < this.nextPipe.x + this.nextPipe.width)
                    this.die()


    }

    think = () => {
        if (!this.nextPipe)
            return;

        let inputs = [
            this.y / p.height,
            this.velocity / 10,
            this.nextPipe.y_top / p.height,
            (this.nextPipe.x - this.x) / p.width
        ]

        let result = this.brain.classifySync(inputs);
        // console.log(result)
        if (result[0].label === "flap") {
            this.flap()
        }
    }

    die = () => {
        this.alive = false
        this.fitness -= 10
    }

    flap = () => {
        this.velocity -= this.flapping_force
    }

    draw = () => {
        p.push()
        p.noStroke()
        p.fill("yellow")
        p.translate(this.x, this.y)
        // p.ellipse(0, 0, 20, 15)
        p.image(birdImage, -15 , -12 , 30,25)
        p.pop()
    }
}