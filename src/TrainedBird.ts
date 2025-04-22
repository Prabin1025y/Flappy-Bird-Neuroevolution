// Import only the types from p5
import type p5 from 'p5';
import Bird from './Bird';
import { Pipe } from './Pipe';
import Ground from './Ground';

export let p: p5
let pipes: Pipe[];
let grounds: Ground[];

let bird: Bird
let brain: any

let modelLoaded: boolean = false

let bestScore: number = 0
let bestScoreP: p5.Element

let timeSlider: p5.Element
let bgImage: p5.Image

const sketch = (_p: p5) => {
    p = _p

    bestScoreP = p.createP("Best Score: " + 0);
    timeSlider = p.createSlider(1, 20, 1);


    p.preload = () => {
        bgImage = p.loadImage("bg.png")
    }

    p.setup = () => {
        p.createCanvas(800, 500);
        ml5.setBackend("cpu"); //use cpu for neural network
        let modelInfo = {
            model: "model/BirdBrain.json",
            metadata: "model/BirdBrain_meta.json",
            weights: "model/BirdBrain.weights.bin",
        }

        brain = ml5.neuralNetwork({
            inputs: 4,
            outputs: ['flap', 'no_flap'],
            task: "classification",
            neuroEvolution: true
        }
        );

        brain.load(modelInfo, () => {
            modelLoaded = true
            initialize()
        })
        grounds = [new Ground(0), new Ground(574), new Ground(2 * 574), new Ground(3 * 574)]

    };

    const initialize = () => {
        pipes = []

        pipes.push(new Pipe())

        //initialize all birds
        bird = new Bird(brain)
    }

    p.draw = () => {
        //summon new pipe in equal interval

        if (!modelLoaded)
            return;

        for (let i = 0; i < Number(timeSlider.value()); i++) {


            if (pipes[pipes.length - 1].x < (p.width - 300))
                pipes.push(new Pipe())

            //remove pipe if it goes outside canvas
            pipes.forEach(pipe => {
                if (pipe.x < -300)
                    pipes.splice(0, 1)

                pipe.update();
            })


            if (bird.alive) {
                bird.update(pipes)
                if (bird.score > bestScore) {
                    bestScore = bird.score
                }
            }

            for (const ground of grounds) {
                ground.update()
            }

        }

        display()

        bestScoreP.html("Best Score: " + bestScore)

    };


    const display = () => {
        p.background(bgImage)

        for (const pipe of pipes) {
            pipe.draw()
        }

        if (bird.alive)
            bird.draw()

        for (const ground of grounds) {
            ground.draw()
        }
    }

};

// @ts-ignore - p5 is available globally from the CDN
new p5(sketch);
