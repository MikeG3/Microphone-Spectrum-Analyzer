const canvas = document.getElementById('spectrum_canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;

// Create and add the Start button only if it doesn’t exist
const startButton = document.createElement('button');
startButton.textContent = "Start Spectrum Analyzer";
startButton.style.padding = '10px 20px';
startButton.style.fontSize = '16px';
document.body.insertBefore(startButton, canvas);

let audioCtx, analyser, bufferLength, dataArray;
//Minimum and max resolution is 64 to 32768 - "Frequency per bin:", audioCtx.sampleRate / analyser.fftSize
const FrequencyResolution = 512;

// Event listener for the Start button
startButton.addEventListener('click', () => {
    // Initialize AudioContext and Analyser after user gesture
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = FrequencyResolution;
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
    startButton.style.display = 'hidden';
});

// Draw the spectrum
function draw() {
    requestAnimationFrame(draw); // Keep drawing on every frame
    analyser.getByteFrequencyData(dataArray);

    const sampleRate = audioCtx.sampleRate; // Usually 44100 Hz or 48000 Hz
    const frequencyPerBin = sampleRate / analyser.fftSize; // Hz per bin
    const maxFrequency = 20000; // 20 kHz

    //debug audio data
    //console.log("Frequency per bin:", audioCtx.sampleRate / analyser.fftSize);
    //console.log("Data array:", dataArray);

    // Clear the canvas with a semi-transparent fill for a trailing effect
    ctx.fillStyle = 'rgba(40, 44, 52, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength);
    let barHeight;
    let x = 0;
    //let red = 10, green = 60, blue = 120;
    let hue = 0, saturation = 100, lightness = 50;

    for (let i = 0; i < bufferLength; i++) {
        
        barHeight = dataArray[i] * 1.5;
        //Create colors per bar using RGB
        /*
        red = (10 + (i * 1)) % 125;
        green = (25 + (i * 2) + 15) % 175;
        blue = (60 + (i * 3) + 30) % 255;
        //Draw bars
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        */
        //Create colors using HSL values
        hue = 360 - Math.floor(((i / bufferLength) * 360) * 2 % 360);
        //console.log(hue);
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        //x += barWidth No Gap between bars
        x += barWidth + 1; //Makes a blank space between bars
    }

    // Draw frequency scale at the bottom of the canvas
    drawFrequencyScale();

}


function drawFrequencyScale() {
    let scaleDivisions = 10; // Number of labels

    
    const maxFrequency = 20000; // Maximum frequency displayed

    // Calculate responsive font size
    const fontSize = Math.max(canvas.width / 50, 12); // Minimum font size 12px
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    for (let i = 0; i <= scaleDivisions; i++) {
        const frequency = (i / scaleDivisions) * maxFrequency;
        const x = (frequency / maxFrequency) * canvas.width;

        // Draw frequency label
        ctx.fillText(`${Math.round(frequency)} Hz`, x, canvas.height - fontSize - 5);
    }
}

function updateScaleDivisions() {
    const width = window.innerWidth;

    if (width > 1200) {
        scaleDivisions = 10; // Larger screens
    } else if (width > 800) {
        scaleDivisions = 7; // Medium screens
    } else if (width > 400) {
        scaleDivisions = 5; // Small screens
    } else {
        scaleDivisions = 3; // Very small screens
    }
}
