// --- DOM Element References ---
const matrixGrid = document.getElementById('matrixGrid');
const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');
const deployBtn = document.getElementById('deployBtn');

// --- Global States ---
let isDrawing = false;
let isErasing = false;

// --- Eraser Toggle Logic ---
eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing; // Toggle state
    if (isErasing) {
        eraserBtn.textContent = 'Eraser: ON';
        eraserBtn.classList.add('active'); // Apply active CSS class
    } else {
        eraserBtn.textContent = 'Eraser: OFF';
        eraserBtn.classList.remove('active'); // Remove active CSS class
    }
});

// --- Pixel Painting Logic ---
function paintPixel(element) {
    if (isErasing) {
        element.style.backgroundColor = '#000000'; // Erase by painting black
    } else {
        element.style.backgroundColor = colorPicker.value; // Paint with selected color
    }
}

// --- Initialize 8x8 Grid and Mouse Events (Desktop) ---
for (let i = 0; i < 64; i++) {
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');
    pixel.dataset.index = i; // Store LED index (0-63)

    // Mouse down: start drawing
    pixel.addEventListener('mousedown', (e) => {
        isDrawing = true;
        paintPixel(e.target);
    });
    
    // Mouse over: continue drawing if mouse is held down
    pixel.addEventListener('mouseover', (e) => {
        if (isDrawing) paintPixel(e.target);
    });

    matrixGrid.appendChild(pixel);
}

// Stop drawing when mouse button is released anywhere on the document
document.addEventListener('mouseup', () => {
    isDrawing = false;
});

// --- Touch Events (Mobile/Tablet) ---
matrixGrid.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent screen scrolling while swiping on the grid
    
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Paint if the touch point is over a pixel
    if (target && target.classList.contains('pixel')) {
        paintPixel(target);
    }
});

// --- Helper: Convert rgb(r, g, b) to Hex String ---
function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '000000';
    if (rgb.startsWith('#')) return rgb.substring(1); // Return hex without '#'
    
    let match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '000000';
    
    function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
    return hex(match[1]) + hex(match[2]) + hex(match[3]);
}

// --- Clear Grid Logic ---
clearBtn.addEventListener('click', () => {
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach(p => p.style.backgroundColor = '#000000'); // Reset all to black
});

// --- Deploy Logic (Send Data to ESP32) ---
deployBtn.addEventListener('click', () => {
    deployBtn.textContent = 'SENDING...'; // UI feedback
    
    const pixels = document.querySelectorAll('.pixel');
    let colorArray = [];
    
    // Extract color of each pixel (0 to 63)
    pixels.forEach(p => {
        colorArray.push(rgbToHex(p.style.backgroundColor));
    });

    // Create a comma-separated payload string (e.g., "ff0000,00ff00,000000,...")
    const payload = colorArray.join(',');

    // Send payload via HTTP POST request to the ESP32
    fetch('/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload
    })
    .then(response => {
        if(response.ok) deployBtn.textContent = 'DEPLOYED!';
        // Revert button text after 1.5 seconds
        setTimeout(() => deployBtn.textContent = 'DEPLOY', 1500); 
    })
    .catch(err => {
        console.error('Error deploying to ESP32:', err);
        deployBtn.textContent = 'ERROR';
    });
});