# Trivia Game

A simple web-based trivia game that challenges players with questions from various categories. Built with HTML, CSS, and JavaScript, this game fetches questions from the Open Trivia Database API and tracks the player's score. Perfect for anyone interested in mythology and trivia games.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- Trivia questions from multiple categories and difficulties
- Real-time score tracking
- User leaderboard showcasing top scores
- Responsive design for various devices

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/mythology-trivia-game.git
   cd mythology-trivia-game
   ```

2. **Install the dependencies:**

   ```sh
   cd Backend
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the `Backend` directory and add the following:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=your_desired_port (optional, default is 6000)
   ```

## Usage

1. **Start the server:**

   ```sh
   cd Backend
   npm run dev
   ```

   The server will start on the port specified in the `.env` file or the default port 6000.

2. **Open the frontend:**

   Open `index.html` in your browser to start playing the game.

## API Endpoints

### POST /submit-score

Submit a user's score.

- **Request:**
  ```json
  {
    "name": "PlayerName",
    "score": 100
  }
  ```

- **Response:**
  ```json
  {
    "message": "Score submitted successfully"
  }
  ```

### GET /leaderboard

Retrieve the top 10 scores.

- **Response:**
  ```json
  [
    {
      "name": "PlayerName1",
      "score": 150
    },
    {
      "name": "PlayerName2",
      "score": 120
    },
    ...
  ]
  ```

## Technologies Used

- **Frontend:**
  - HTML
  - CSS
  - JavaScript

- **Backend:**
  - Node.js
  - Express
  - Mongoose
  - MongoDB

- **Dependencies:**
  - `cors`: Enables Cross-Origin Resource Sharing
  - `dotenv`: Loads environment variables from a `.env` file
  - `nodemon`: Automatically restarts the server on file changes (development use)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
