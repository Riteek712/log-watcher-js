# Log Watching Solution

This project implements a log-watching solution using Node.js. It consists of a WebSocket server that monitors a log file for updates and streams these updates to connected clients in real-time. The client-side is a simple web page that displays the log updates.

## Features

- **Server-Side:**
  - Monitors a log file for changes.
  - Streams new log entries to connected WebSocket clients.
  - Sends the last 10 lines of the log file to new clients.

- **Client-Side:**
  - Connects to the WebSocket server.
  - Displays real-time log updates without refreshing the page.

## Usage

- The server will start on `ws://localhost:8080`.
- Open the `index.html` file in a web browser to view the log updates.

## Notes

- Make sure to adjust the `LOG_FILE_PATH` in `server.js` to point to the actual log file you want to monitor.
- The server will watch for file changes and push updates to all connected clients.
- The client-side JavaScript code handles WebSocket connections and updates the log display in real-time.

## Setup

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd log-watcher
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create and populate the log file:**

    ```bash
    touch logfile.log
    ```

4. **Run the server:**

    ```bash
    node server.js
    ```

5. **Access the client:**

    Open `index.html` in a web browser or serve it using a local HTTP server.



## License

This project is licensed under the MIT License.
