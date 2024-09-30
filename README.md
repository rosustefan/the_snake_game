# The Snake Game built in Rust, WASM and JS (TS)

## [Memento to self] Continue course with: Section 20: Deployment / 113. Deployment & Course Finish

## Useful actions and commands:
1. Run npm server
- go to ../www
- run command in CLI: npm run dev

2. Pack Rust code to WASM
- run command in CLI: wasm-pack build --target web

3. Build for PROD
- go to ../www
- run command in CLI: npm run build

4. Serve in PROD
- go to / folder
- run command in CLI: npm start

5. Serve manually on my AWS EC2 instance until I implement a systemd service or 
a [pm2](https://gist.github.com/bradtraversy/cd90d1ed3c462fe3bddd11bf8953a896) process manager 
- go to / folder
- nohup npm start > log.txt 2>&1 &



## Useful URLs:
- https://webassembly.github.io/wabt/demo/wat2wasm/
