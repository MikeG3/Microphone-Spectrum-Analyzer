const canvas = document.getElementById('spectrum');
const ctx = canvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Request microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        draw();
    })
    .catch(err => {
        console.error('Error accessing microphone:', err);
    });

// Draw the spectrum
function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

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
