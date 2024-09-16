
import init, { Direction, GameStatus, World } from "snake_game";
import { rnd } from "./utils/rnd";

init().then(wasm => {
    const CELL_SIZE = 30;
    const WORLD_WIDTH = 8;
    const snake_SpawnIdx = rnd(WORLD_WIDTH * WORLD_WIDTH);

    const world = World.new(WORLD_WIDTH, snake_SpawnIdx);
    const worldWidth = world.width();

    const gameStatus = document.getElementById("game-status");
    const points = document.getElementById("points");
    const gameControlBtn = document.getElementById("game-control-btn");
    const canvas = <HTMLCanvasElement>document.getElementById("snake-canvas");

    const ctx = canvas.getContext("2d");

    canvas.height = worldWidth * CELL_SIZE;
    canvas.width = worldWidth * CELL_SIZE;

    // start the game
    gameControlBtn.addEventListener("click", _ => {
        const status = world.game_status();

        if (status === undefined) {
            gameControlBtn.textContent = "Stop";
            world.start_game();
            play();
        } else {
            location.reload();
        }
    });

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

    // Add swipe events for touch-screen devices
    let startX, startY, endX, endY;
    
    document.addEventListener("touchstart", (event) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener("touchend", (event) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
    
        handleSwipe();
    });
    
    function handleSwipe() {
        let diffX = endX - startX;
        let diffY = endY - startY;
    
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                // Move right
                world.change_snake_dir(Direction.Right);
            } else {
                // Move left
                world.change_snake_dir(Direction.Left);
            }
        } else {
            if (diffY > 0) {
                // Move down
                world.change_snake_dir(Direction.Down);
            } else {
                // Move up
                world.change_snake_dir(Direction.Up);
            }
        }
    }

    function drawWorld() {
        // Set the background to white
        ctx.fillStyle = "#d3d3d3"; // light grey color for the Snake World
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();

        // Set the color of the borders (grid lines)
        ctx.strokeStyle = "#95a5a6";  // Change this to any color you like (e.g., red)

        for (let x = 0; x < worldWidth + 1; x++) {
            ctx.moveTo(CELL_SIZE * x, 0);
            ctx.lineTo(CELL_SIZE * x, worldWidth * CELL_SIZE);
        }

        for (let y = 0; y < worldWidth + 1; y++) {
            ctx.moveTo(0, CELL_SIZE * y);
            ctx.lineTo(worldWidth * CELL_SIZE, CELL_SIZE * y);
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

        // filter out duplicates
        // reverse array
        snakeCells
            // .filter((cellIdx, i) => !(i > 0 && cellIdx === snakeCells[0]))
            .slice()
            .reverse()
            .forEach((cellIdx, i) => {
                // we are overriding snake head color by body when we crash
                const fillCollor = i === snakeCells.length - 1 ? "#7878db" : "#000000";
                drawRect(cellIdx, fillCollor);
            })
    }

    function paint() {
        drawWorld();
        drawSnake();
        drawReward();
        drawGameStatus();
    }

    function drawGameStatus() {
        gameStatus.textContent = world.game_status_text();
        points.textContent = world.points().toString();
    }

    function play() {
        const status = world.game_status();

        if (status == GameStatus.Won || status == GameStatus.Lost) {
            gameControlBtn.textContent = "Play Again";
            return;
        }

        const fps = 5;

        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);  // clear canvas
            world.step();
            paint();
            // this method takes a callback to be invoked before the next repaint
            requestAnimationFrame(play);
        }, 1000 / fps)
    }

    paint();
})