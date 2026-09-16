// --- DOM Element References ---
const matrixGrid = document.getElementById('matrixGrid');
const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');
const deployBtn = document.getElementById('deployBtn');

// --- Global States ---
let isDrawing = false;
let isErasing = false;
let isUnlocked = false; // State to track max brightness unlock

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

// ==========================================
// --- Preset Colors & Brightness ---
// ==========================================

const colorPresets = document.getElementById('colorPresets');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightVal = document.getElementById('brightVal');
let brightnessTimeout; // Biến phục vụ tính năng chống dội lệnh (Debounce)

// Array containing basic preset colors
const commonColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff']; 

// --- Initialize Preset Colors ---
function initPresetColors() {
    colorPresets.innerHTML = ''; 
    commonColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.classList.add('preset-swatch');
        swatch.style.backgroundColor = color;
        
        // Update the main Color Picker when a preset color is clicked
        swatch.addEventListener('click', () => {
            colorPicker.value = color;
        });
        
        colorPresets.appendChild(swatch);
    });
}
initPresetColors();

// --- Brightness Slider Real-time Update (Debounced) ---
brightnessSlider.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    
    // Enforce minimum brightness floor at 5
    if (val < 5) {
        val = 5;
        e.target.value = 5;
    }

    // Lock slider at 120 if not unlocked yet
    if (!isUnlocked && val > 120) {
        val = 120;
        e.target.value = 120; // Ép thanh trượt dừng trên giao diện
    }
    
    brightVal.textContent = val;

    // Chống treo ESP32: Hủy lệnh gửi đi nếu người dùng vẫn đang kéo tay
    clearTimeout(brightnessTimeout);
    
    // Chỉ gửi dữ liệu đi sau khi tay người dùng ngừng kéo 100 mili-giây
    brightnessTimeout = setTimeout(() => {
        fetch('/brightness', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: val.toString()
        }).catch(err => console.error('Brightness Error:', err));
    }, 100);
});

// ==========================================
// --- Tab Navigation Logic ---
// ==========================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Remove 'active' state from all buttons and tab contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // 2. Activate the clicked button
        btn.classList.add('active');

        // 3. Find and display the corresponding tab content based on data-target
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// ==========================================
// --- Unlock Max Brightness Logic ---
// ==========================================
const unlockBtn = document.getElementById('unlockBtn');
const limitMark = document.querySelector('.limit-mark');

unlockBtn.addEventListener('click', () => {
    // Do nothing if already unlocked
    if (isUnlocked) return;

    // Confirmation dialog with clear V and A specifications
    const isSure = confirm("POWER LOAD DANGER WARNING [!]\n\nAn 8x8 LED Matrix (64 LEDs) at maximum brightness (255) will draw up to ~3.8A of current.\n\nIf you are powering this via a computer USB port (limited to 0.5A) or a weak phone charger, your ESP32 or USB port WILL BURN OUT!\n\nMANDATORY REQUIREMENT:\n- You must use an external power supply or adapter rated for: 5V and MINIMUM 4A.\n\nHave you connected an adequate external power supply, and are you sure you want to unlock?");

    if (isSure) {
        isUnlocked = true; // Set unlocked flag to true
        
        // Change button appearance to green (indicating unlocked)
        unlockBtn.textContent = "[ UNLOCKED: MAX 255 ]";
        unlockBtn.classList.add('unlocked');
        
        // Turn the red limit line green to signify limit released
        if (limitMark) {
            limitMark.style.backgroundColor = '#00ff00';
        }
        
        alert("Brightness limit unlocked!\nPlease drag the slider up very slowly to check power stability.");
    }
});