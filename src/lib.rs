use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;

// Use `wee_alloc` as the global memory allocator.
#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

// Import the rnd() function from JS
// Specifies the "C" calling convention for the rnd() function
#[wasm_bindgen(module = "/www/utils/rnd.js")]
extern "C" {
    fn rnd(max: usize) -> usize;
}

#[wasm_bindgen]
#[derive(PartialEq)]
pub enum Direction {
    Up,
    Right,
    Down,
    Left,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum GameStatus {
    Won,
    Lost,
    Played,
}

#[derive(PartialEq, Clone, Copy)]
pub struct SnakeCell(usize);

struct Snake {
    body: Vec<SnakeCell>,
    direction: Direction,
}

impl Snake {
    fn new(spawn_index: usize, size: usize) -> Snake {
        let mut body = vec![];

        for i in 0..size {
            body.push(SnakeCell(spawn_index - i));
        }

        Snake {
            body,
            direction: Direction::Right,
        }
    }
}

#[wasm_bindgen]
pub struct World {
    width: usize,
    snake: Snake,
    size: usize,
    next_cell: Option<SnakeCell>,
    reward_cell: Option<usize>,
    status: Option<GameStatus>,
    points: usize,
}

#[wasm_bindgen]
impl World {
    pub fn new(width: usize, snake_idx: usize) -> World {
        let snake = Snake::new(snake_idx, 3);
        let size = width * width;

        World {
            width,
            size,
            reward_cell: World::gen_reward_cell(size, &snake.body),
            snake,
            next_cell: None,
            status: None,
            points: 0,
        }
    }

    fn gen_reward_cell(max: usize, snake_body: &Vec<SnakeCell>) -> Option<usize> {
        let mut reward_cell;

        loop {
            reward_cell = rnd(max);
            if !snake_body.contains(&SnakeCell(reward_cell)) {
                break;
            }
        }

        Some(reward_cell)
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn points(&self) -> usize {
        self.points
    }

    pub fn reward_cell(&self) -> Option<usize> {
        self.reward_cell
    }

    pub fn snake_head_idx(&self) -> usize {
        self.snake.body[0].0
    }

    pub fn start_game(&mut self) {
        self.status = Some(GameStatus::Played);
    }

    pub fn game_status(&self) -> Option<GameStatus> {
        self.status
    }

    pub fn game_status_text(&self) -> String {
        match self.status {
            Some(GameStatus::Won) => String::from("You have won!"),
            Some(GameStatus::Lost) => String::from("You have lost!"),
            Some(GameStatus::Played) => String::from("Playing!"),
            None => String::from("No Status"),
        }
    }

    pub fn change_snake_dir(&mut self, direction: Direction) {
        // prevent snake head to move into itself
        // e.g., cannot change direction Right if the body is there
        let next_cell = self.gen_next_snake_cell(&direction);
        if self.snake.body[1].0 == next_cell.0 {
            return;
        }

        self.next_cell = Some(next_cell); // equivalent to Option::Some(next_cell)
        self.snake.direction = direction;
    }

    pub fn snake_length(&self) -> usize {
        self.snake.body.len()
    }

    // *const is a raw pointer; borrowing rules don't apply to it
    pub fn snake_cells(&self) -> *const SnakeCell {
        self.snake.body.as_ptr()
    }

    // cannot return a reference to JS because of borrowing rules --> need the raw pointer
    // pub fn snake_cells(&self) -> &Vec<SnakeCell> {
    //     &self.snake.body
    // }

    // move the snake in the World
    pub fn step(&mut self) {
        match self.status {
            Some(GameStatus::Played) => {
                let snake_clone = self.snake.body.clone();

                // move the snake's head
                match self.next_cell {
                    Some(cell) => {
                        self.snake.body[0] = cell;
                        self.next_cell = None;
                    }
                    None => {
                        self.snake.body[0] = self.gen_next_snake_cell(&self.snake.direction);
                    }
                }

                // move the snake's body
                for i in 1..self.snake_length() {
                    self.snake.body[i] = SnakeCell(snake_clone[i - 1].0);
                }

                // check snake head for overlap/crash into snake body
                if self.snake.body[1..self.snake_length()].contains(&self.snake.body[0]) {
                    self.status = Some(GameStatus::Lost)
                }

                if self.reward_cell == Some(self.snake_head_idx()) {
                    if self.snake_length() < self.size {
                        self.points += 1; // win 1 point for each collected reward cell
                        self.reward_cell = World::gen_reward_cell(self.size, &self.snake.body)
                    } else {
                        self.reward_cell = None; // last reward_cell will be None / not displayed
                        self.status = Some(GameStatus::Won)
                    }

                    self.snake.body.push(SnakeCell(self.snake.body[1].0));
                }
            }
            _ => {}
        }
    }

    // select move direction of the head
    fn gen_next_snake_cell(&self, direction: &Direction) -> SnakeCell {
        let snake_idx = self.snake_head_idx();
        let row = snake_idx / self.width;

        return match direction {
            Direction::Right => {
                let threshold = (row + 1) * self.width;
                if snake_idx + 1 == threshold {
                    SnakeCell(threshold - self.width)
                } else {
                    SnakeCell(snake_idx + 1)
                }
            }
            Direction::Left => {
                let threshold = row * self.width;
                if snake_idx == threshold {
                    SnakeCell(threshold + (self.width - 1))
                } else {
                    SnakeCell(snake_idx - 1)
                }
            }
            Direction::Up => {
                let threshold = snake_idx - (row * self.width);
                if snake_idx == threshold {
                    SnakeCell((self.size - self.width) + threshold)
                } else {
                    SnakeCell(snake_idx - self.width)
                }
            }
            Direction::Down => {
                let threshold = snake_idx + ((self.width - row) * self.width);
                if snake_idx + self.width == threshold {
                    SnakeCell(threshold - ((row + 1) * self.width))
                } else {
                    SnakeCell(snake_idx + self.width)
                }
            }
        };
    }
}

// build Rust source code into WASM
// wasm-pack build --target web
