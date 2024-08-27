
import init, { Direction, World } from "snake_game";
import { rnd } from "./utils/rnd";

init().then(wasm => {
    const CELL_SIZE = 30;
    const WORLD_WIDTH = 5;
    const snake_SpawnIdx = rnd(WORLD_WIDTH * WORLD_WIDTH);

    const world = World.new(WORLD_WIDTH, snake_SpawnIdx);
    const worldWidth = world.width();

    const canvas = <HTMLCanvasElement>document.getElementById("snake-canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = worldWidth * CELL_SIZE;
    canvas.width = worldWidth * CELL_SIZE;

    document.addEventListener("keydown", (event) => {
        // console.log(event.code);
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                world.change_snake_dir(Direction.Up);
                break;
            case "ArrowRight":
            case "KeyD":
                world.change_snake_dir(Direction.Right);
                break;
            case "ArrowDown":
            case "KeyS":
                world.change_snake_dir(Direction.Down);
                break;
            case "ArrowLeft":
            case "KeyA":
                world.change_snake_dir(Direction.Left);
                break;
        }
    })

    function drawWorld() {
        ctx.beginPath();

        for (let x = 0; x < worldWidth + 1; x++) {
            ctx.moveTo(CELL_SIZE * x, 0);
            ctx.lineTo(CELL_SIZE * x, worldWidth * CELL_SIZE)
        }

        for (let y = 0; y < worldWidth + 1; y++) {
            ctx.moveTo(0, CELL_SIZE * y);
            ctx.lineTo(worldWidth * CELL_SIZE, CELL_SIZE * y)
        }

        ctx.stroke();
    }

    function drawRect(idx: number, fillColor: string) {
        const col = idx % worldWidth;
        const row = Math.floor(idx / worldWidth);

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.fillRect(
            col * CELL_SIZE, // 2 * 10 = 20
            row * CELL_SIZE, // 1 * 10 = 10
            CELL_SIZE, // 10
            CELL_SIZE // 10
        );
        ctx.stroke();
    }

    function drawReward() {
        const idx = world.reward_cell();
        const fillCollor = "#FF0000";
        drawRect(idx, fillCollor);

        // [TESTING] Stop the game if the snake occupies the entire grid
        if (idx === 1000) {
            alert("You Won!");
        }
    }


    function drawSnake() {
        const snakeCells = new Uint32Array(
            wasm.memory.buffer,
            world.snake_cells(),
            world.snake_length()
        )

        snakeCells.forEach((cellIdx, i) => {
            const fillCollor = i === 0 ? "#7878db" : "#000000";
            drawRect(cellIdx, fillCollor);
        })
    }


    function paint() {
        drawWorld();
        drawSnake();
        drawReward();
    }

    function update() {
        const fps = 5;
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);  // clear canvas
            world.step();
            paint();
            // this method takes a callback to be invoked before the next repaint
            requestAnimationFrame(update);
        }, 1000 / fps)
    }

    paint();
    update();
})