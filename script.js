const canvas = document.getElementById('spectrum_canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
const isMobile = window.innerWidth < 600;

// Create and add the Start button and style it
const startButton = document.createElement('button');
startButton.textContent = "Start Spectrum Analyzer";
Object.assign(startButton.style, {
    padding: '10px 20px',
    fontSize: '50px',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    border: '2px solid #FFFFFF',
    borderRadius: '50px',
    boxShadow: '0 0 40px #ffffff',
});

if (isMobile) {
    Object.assign(startButton.style, {
    padding: '10px 20px',
    fontSize: '30px',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    border: '2px solid #FFFFFF',
    borderRadius: '30px',
    boxShadow: '0 0 30px #ffffff',
    });
}

document.body.insertBefore(startButton, canvas);

let audioCtx, analyser, bufferLength, dataArray;
//Minimum and max resolution is 64 to 32768 - "Frequency per bin:", audioCtx.sampleRate / analyser.fftSize
const FrequencyResolution = 32768;

// Event listener for the Start button
startButton.addEventListener('click', () => {

    //Remove Start button after click
    startButton.remove();

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

    //Audio Variables
    const sampleRate = audioCtx.sampleRate; // Usually 44100 Hz or 48000 Hz
    const frequencyPerBin = sampleRate / analyser.fftSize; // Hz per bin
    const minFrequency = 20; // 20 Hz
    const maxFrequency = 20000; // 20 kHz

    //Padding
    const fontSize = Math.max(canvas.width / 50, 12);
    const padding = fontSize * 2;
    const availableWidth = canvas.width - 2 * padding;

    //DEBUG AUDIO DATA
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
        
        const frequency = i * frequencyPerBin;

        if (frequency < minFrequency || frequency > maxFrequency) continue;

        const x = padding + getLogPosition(frequency, minFrequency, maxFrequency, canvas.width);

        const barHeight = dataArray[i] * 1.5;

        //Color Selection
        const hue = 360 - Math.floor((i / bufferLength) * 360); //Linear
        /*
        const t = (Math.log10(frequency) - logMin) / logRange; // Logarithmic mapping for color
        const hue = 360 - (t * 360);
        */
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

        const nextFrequency = (i + 1) * frequencyPerBin;
        const nextX = getLogPosition(nextFrequency, minFrequency, maxFrequency, canvas.width);

        const barWidth = Math.max(nextX - x, 1);

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    }

    // Draw frequency scale at the bottom of the canvas
    drawFrequencyScale()
}

    // Draw frequency scale at the bottom of the canvas
    function drawFrequencyScale() {
        // Update scale divisions based on window width for responsiveness
        const scaleDivisions = updateScaleDivisions();
        const minFrequency = 20;  // Minimum frequency displayed
        const maxFrequency = 20000; // Maximum frequency displayed

        // Check if the device is mobile for text height adjustment and set it
        //const isMobile = window.innerWidth < 600;
        const textHeight = isMobile ? 10 : 30; // Adjust text height for mobile devices
    
        // Calculate responsive font size
        const fontSize = Math.max(canvas.width / 50, 12); // Minimum font size 12px
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
    
        const frequencyRange = maxFrequency - minFrequency; // Total frequency range
    
        // Define padding so labels are not cut off at edges
        const padding = fontSize * 2; // Proportional padding based on font size
        const availableWidth = canvas.width - 2 * padding; // Space for labels to fit
    
        //Designated Frequency Labels
        //const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
        let frequencies;
        
        if (isMobile) {
            frequencies = [20, 100, 500, 1000, 2000, 5000, 20000];
        } else {
            frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
        }
        

        // Frequency Scale Loop
        for (let freq of frequencies) {
            if (freq < minFrequency || freq > maxFrequency) continue;

            const x = padding + getLogPosition(freq, minFrequency, maxFrequency, availableWidth);

            // Format label to Hz or KHz
            let label;
            if (freq >= 1000) {
                label = (freq / 1000) + " kHz";
            } else {
                label = freq + " Hz";
            }

            ctx.fillText(label, x, canvas.height - fontSize + textHeight);
        }
    }

function updateScaleDivisions() {
    const width = window.innerWidth;

    if (width > 1200) return 10;
    if (width > 800) return 8;
    if (width > 400) return 5;
    return 3;
}

// Logarithmic mapping function to position frequencies on the canvas
function getLogPosition(frequency, minFreq, maxFreq, width) {
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    const logFreq = Math.log10(frequency);

    return ((logFreq - logMin) / (logMax - logMin)) * width;
}