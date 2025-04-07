// reader.js
const video = document.getElementById('barcode-scanner');
const frameCanvas = document.getElementById('frame');
const changeCameraBtn = document.getElementById('change-camera');
const ctx = frameCanvas.getContext('2d');

let barcodeDetector;
let timer;
let flashLightOn = false;
let isFrontCamera = false;

const openCameraBtn = document.getElementById('open-camera-btn');
const closeCameraBtn = document.getElementById('close-camera-btn');
const flashLightBtn = document.getElementById('flash-light-btn');
const indicatorText = document.getElementById('indicator-text');
const scanResultElement = document.getElementById('scan-result');
const barcodeInput = document.getElementById('BarcodeInput');
const focusBox = document.querySelector('.focus-box');

function startCamera() {
    if ('BarcodeDetector' in window) {
        barcodeDetector = new BarcodeDetector();
    } else {
        console.error('Barcode detection is not supported in this browser.');
        alert('Barcode detection is not supported in this browser.');
        return;
    }

    const facingMode = isFrontCamera ? "user" : "environment";
    const constraints = {
        video: {
            facingMode: facingMode,
            torch: false
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
        openCameraBtn.style.display = 'none';
        closeCameraBtn.style.display = 'inline-block';
        flashLightBtn.style.display = 'inline-block';
        changeCameraBtn.style.display = 'inline-block';
        focusBox.style.display = 'block';
        startInterval();
    })
    .catch(function(err) {
        console.error('Camera access error:', err);
        alert('Error accessing camera. Please make sure you have granted access to the camera and reload the page.');
    });

    video.addEventListener('play', function() {
        const $this = this;
        (function loop() {
            if (!$this.paused && !$this.ended) {
                preprocessImage($this);
                setTimeout(loop, 1000 / 30);
            }
        })();
    });
}

function stopCamera() {
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(function(track) {
        track.stop();
    });

    video.srcObject = null;
    clearInterval(timer);
    openCameraBtn.style.display = 'inline-block';
    closeCameraBtn.style.display = 'none';
    flashLightBtn.style.display = 'none';
    changeCameraBtn.style.display = 'none';
    focusBox.style.display = 'none';
}

function toggleFlashLight() {
    if (flashLightOn) {
        turnOffFlashLight();
    } else {
        turnOnFlashLight();
    }
}

function turnOnFlashLight() {
    flashLightOn = true;
    const tracks = video.srcObject.getTracks();
    tracks.forEach(function(track) {
        if (track.kind === 'video') {
            track.applyConstraints({ advanced: [{ torch: true }] });
        }
    });
}

function turnOffFlashLight() {
    flashLightOn = false;
    const tracks = video.srcObject.getTracks();
    tracks.forEach(function(track) {
        if (track.kind === 'video') {
            track.applyConstraints({ advanced: [{ torch: false }] });
        }
    });
}

function startInterval() {
    timer = setInterval(function() {
        preprocessImage(video);
        scanBarcode();
    }, 500);
}

function preprocessImage(video) {
    const width = video.videoWidth;
    const height = video.videoHeight;
    
    frameCanvas.width = width;
    frameCanvas.height = height;
    
    ctx.drawImage(video, 0, 0, width, height);
    
    if ('BarcodeDetector' in window) {
        barcodeDetector.detect(frameCanvas)
            .then(barcodes => {
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(video, 0, 0, width, height);
                
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 4;
                barcodes.forEach(barcode => {
                    ctx.beginPath();
                    ctx.rect(barcode.boundingBox.x, barcode.boundingBox.y, barcode.boundingBox.width, barcode.boundingBox.height);
                    ctx.stroke();
                });
            })
            .catch(error => {
                console.error('Barcode detection error:', error);
            });
    } else {
        console.error('Barcode detection is not supported in this browser.');
    }
}

function toggleCamera() {
    isFrontCamera = !isFrontCamera;
    stopCamera();
    startCamera();
    
    changeCameraBtn.innerText = isFrontCamera ? 'Front Cam' : 'Face Cam';
}

openCameraBtn.addEventListener('click', startCamera);
closeCameraBtn.addEventListener('click', stopCamera);
flashLightBtn.addEventListener('click', toggleFlashLight);
changeCameraBtn.addEventListener('click', toggleCamera);

function updateIndicator() {
    if (!barcodeDetector) {
        console.error('Barcode detector is not initialized.');
        return;
    }

    barcodeDetector.detect(video)
        .then(barcodes => {
            if (barcodes.length > 0) {
                indicatorText.textContent = 'Detected';
                indicatorText.style.color = 'green';
                barcodeInput.value = barcodes[0].rawValue;
            } else {
                indicatorText.textContent = 'Ready';
                indicatorText.style.color = 'blue';
            }
        })
        .catch(error => {
            console.error('Barcode detection error:', error);
            indicatorText.textContent = 'Idle';
            indicatorText.style.color = 'red';
        });
}

setInterval(updateIndicator, 1000);

function scanBarcode() {
    barcodeDetector.detect(video)
    .then(barcodes => {
        if (barcodes.length > 0) {
            const scannedData = barcodes[0].rawValue;
            scanResultElement.innerText = "Barcode detected: " + scannedData;
            barcodeInput.value = scannedData;
            searchProduct(scannedData);
            updateButtonVisibility();
        } else {
            scanResultElement.innerText = "";
        }
    })
    .catch(err => {
        console.error('Barcode detection error:', err);
    });
}

function toggleFlashAnimation() {
    const flashLightBtn = document.getElementById('flash-light-btn');
    const flashImage = document.getElementById('flash-light-img');

    flashImage.classList.toggle('flash-off');

    if (flashImage.classList.contains('flash-off')) {
        flashImage.src = 'icon/flashlight_on.svg';
    } else {
        flashImage.src = 'icon/flashlight_off.svg';
    }
}

const flashLightBtnAnimation = document.getElementById('flash-light-btn');
flashLightBtnAnimation.addEventListener('click', toggleFlashAnimation);
