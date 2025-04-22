// Import only the types from p5
import type p5 from 'p5';
import Bird from './Bird';
import { Pipe } from './Pipe';
import Ground from './Ground';

const populationSizeSlider = document.getElementById("population-size") as HTMLInputElement;
const populationSizeValue = document.getElementById("population-size-value") as HTMLDivElement;
const simulationSpeedSlider = document.getElementById("simulation-speed") as HTMLInputElement;
const simulationSpeedValue = document.getElementById("simulation-speed-value") as HTMLDivElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const generationElement = document.getElementById("generation");
const bestScoreElement = document.getElementById("best-score");
const birdsAliveElement = document.getElementById("birds-alive");

let width: number = document.getElementById("game-container")?.offsetWidth || 800;
let height: number = document.getElementById("game-container")?.offsetHeight || 500;
let running: boolean = false;

interface GameInfo {
  generation: number;
  bestScore: number;
  birdsAlive: number;
}

// Update slider values
populationSizeSlider.addEventListener("input", function (this: HTMLInputElement): void {
  populationSizeValue.textContent = this.value;
});

simulationSpeedSlider.addEventListener("input", function (this: HTMLInputElement): void {
  simulationSpeedValue.textContent = `${this.value}x`;
});

// Button click animations
startBtn.addEventListener("click", function (this: HTMLButtonElement): void {
  this.classList.add("active");
  setTimeout((): void => this.classList.remove("active"), 200);

  // Here you would start your simulation
  if (running) {
    running = false;
    p.noLoop();
    startBtn.innerText = "Resume"
  } else {
    running = true
    p.loop()
    startBtn.innerText = "Pause"
  }
});

resetBtn.addEventListener("click", function (this: HTMLButtonElement): void {
  this.classList.add("active");
  setTimeout((): void => this.classList.remove("active"), 200);

  // Here you would reset your simulation
  popSize = Number(populationSizeSlider.value)

  birds = []
  pipes = []

  pipes.push(new Pipe())

  //initialize all birds
  for (let i = 0; i < popSize; i++) {
    birds[i] = new Bird();
  }

  birdsAlive = popSize

  grounds = [new Ground(0), new Ground(574), new Ground(2 * 574), new Ground(3 * 574)]

  generation = 1;
  bestScore = 0

});

export let p: p5
let birds: Bird[];
let pipes: Pipe[];
let grounds: Ground[];

// let nextPipe: Pipe
let popSize: number

// let bestBrain: any

let generation: number = 1
let birdsAlive: number
// let generationP: p5.Element

let bestScore: number = 0
// let bestScoreP: p5.Element

// let timeSlider: p5.Element
// let saveButton: p5.Element

let bgImage: p5.Image
export let birdImage: p5.Image
export let pipeImage: p5.Image
export let groundIMage: p5.Image

const sketch = (_p: p5) => {
  p = _p

  // bestScoreP = p.createP("Best Score: " + 0);
  // generationP = p.createP("Generation: 1")
  // timeSlider = p.createSlider(1, 20, 1);
  // saveButton = p.createButton("Save Model");

  p.preload = () => {
    bgImage = p.loadImage("bg.png")
    birdImage = p.loadImage("bird.png")
    pipeImage = p.loadImage("pipe.png")
    groundIMage = p.loadImage("ground.png")

    p.noLoop()
  }

  p.setup = () => {
    ml5.setBackend("cpu"); //use cpu for neural network

    // p.createCanvas(800, 500);
    let cnv = p.createCanvas(width, height);
    cnv.parent("game-container");

    popSize = Number(populationSizeSlider.value)

    birds = []
    pipes = []

    pipes.push(new Pipe())

    //initialize all birds
    for (let i = 0; i < popSize; i++) {
      birds[i] = new Bird();
    }

    birdsAlive = popSize

    grounds = [new Ground(0), new Ground(574), new Ground(2 * 574), new Ground(3 * 574)]
  };

  p.draw = () => {
    //summon new pipe in equal interval
    for (let i = 0; i < Number(simulationSpeedSlider.value); i++) {
      popSize = Number(populationSizeSlider.value)

      // saveButton.mousePressed(saveModel)

      if (pipes[pipes.length - 1].x < (p.width - 300))
        pipes.push(new Pipe())

      //remove pipe if it goes outside canvas
      pipes.forEach(pipe => {
        if (pipe.x < -300)
          pipes.splice(0, 1)

        pipe.update();
      })

      //reproduce if all birds are dead
      if (isAllDead())
        reproduction()


      // nextPipe = getNextPipe();

      birdsAlive = 0
      birds.forEach(bird => {
        if (bird.alive) {
          birdsAlive++;
          bird.update(pipes)
          if (bird.score > bestScore) {
            bestScore = bird.score
            // bestBrain = bird.brain
          }
        }

      });

      for (const ground of grounds) {
        ground.update()
      }
    }

    display()

    updateGameInfoUI({ generation: generation, bestScore: bestScore, birdsAlive: birdsAlive })

    // bestScoreP.html("Best Score: " + bestScore)
    // generationP.html("Generation: " + generation)

  };

  // const saveModel = () => {
  //   bestBrain.save("BirdBrain");
  // }

  const display = () => {
    p.background(bgImage)

    for (const pipe of pipes) {
      pipe.draw()
    }

    for (const bird of birds) {
      if (bird.alive)
        bird.draw()
    }

    for (const ground of grounds) {
      ground.draw()
    }
  }

  const isAllDead = (): boolean => {
    for (const bird of birds) {
      if (bird.alive)
        return false
    }
    return true
  }

  // const getNextPipe = (): Pipe => {
  //   for (let i = 0; i < pipes.length; i++) {
  //     if (pipes[i].x > (birds[0].x - pipes[i].width - 15)) {
  //       return pipes[i]
  //     }

  //   }
  //   return pipes[0]
  // }
};

const reproduction = () => {
  resetPipes();
  normalizeFitness();
  let nextBirds = []
  for (let i = 0; i < popSize; i++) {
    let child = weightedSelection()
    child.mutate(0.01)
    nextBirds[i] = new Bird(child)
  }
  birds = nextBirds
  generation++;
}

const resetPipes = () => {
  pipes = []
  pipes.push(new Pipe())
}

const normalizeFitness = () => {
  let sum = 0;
  for (const bird of birds) {
    sum += bird.fitness;
  }

  for (const bird of birds) {
    bird.fitness /= sum
  }
}

const weightedSelection = () => {
  let index = 0;
  let r = p.random(1)
  while (r > 0) {
    r = r - birds[index].fitness
    index++
  }
  index--;
  return birds[index].brain
}

const updateGameInfoUI = (info: GameInfo): void => {

  if (generationElement) generationElement.textContent = info.generation.toString();
  if (bestScoreElement) bestScoreElement.textContent = info.bestScore.toString();
  if (birdsAliveElement) birdsAliveElement.textContent = info.birdsAlive.toString();
};

// @ts-ignore - p5 is available globally from the CDN
new p5(sketch);