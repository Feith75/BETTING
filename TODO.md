# TODO: Integrate Racing Car from YouTube Video and Add Background Video

## Steps to Complete:
- [x] Update game.js to change the car image source to a Lamborghini image from assets (e.g., '/assets/lambo_real_car.png') to represent the car from the YouTube video.
- [x] Add an embedded YouTube video iframe in the race view (index.html) as a background video that autoplays, loops, and is muted, using the provided YouTube link.
- [x] Test the changes to ensure the car image loads and the video plays in the background during races.
- [x] Fix AI race functionality by passing socket to RacingGame constructor and enabling real-time position updates and lap tracking.
- [x] Update game.js to emit player updates and lap finishes to the server for proper multiplayer/AI synchronization.
- [x] Adjust physics parameters (maxSpeed, acceleration) to make the game playable and balanced for AI races.
