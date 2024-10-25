const canvas = document.getElementById('spectrum');
const ctx = canvas.getContext('2d');

// Create and add the Start button only if it doesn’t exist
const startButton = document.createElement('button');
startButton.textContent = "Start Spectrum Analyzer";
startButton.style.padding = '10px 20px';
startButton.style.fontSize = '16px';
document.body.insertBefore(startButton, canvas);

let audioCtx, analyser, bufferLength, dataArray;

// Event listener for the Start button
startButton.addEventListener('click', () => {
    // Initialize AudioContext and Analyser after user gesture
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            // Start the animation loop
            draw();
        })
        .catch(err => {
            console.error('Error accessing microphone:', err);
        });

    // Hide the start button after initializing the audio
    startButton.style.display = 'none';
});

// Draw the spectrum
function draw() {
    requestAnimationFrame(draw); // Keep drawing on every frame
    analyser.getByteFrequencyData(dataArray);

    // Clear the canvas with a semi-transparent fill for a trailing effect
    ctx.fillStyle = 'rgba(40, 44, 52, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}
