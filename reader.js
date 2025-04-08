class CodeReader {
    constructor() {
        this.video = document.getElementById('barcode-scanner');
        this.frameCanvas = document.getElementById('frame');
        this.changeCameraBtn = document.getElementById('change-camera');
        this.ctx = this.frameCanvas?.getContext('2d');

        this.barcodeDetector = null;
        this.timer = null;
        this.flashLightOn = false;
        this.isFrontCamera = false;

        this.openCameraBtn = document.getElementById('open-camera-btn');
        this.closeCameraBtn = document.getElementById('close-camera-btn');
        this.flashLightBtn = document.getElementById('flash-light-btn');
        this.indicatorText = document.getElementById('indicator-text');
        this.scanResultElement = document.getElementById('scan-result');
        this.codeResult = document.getElementById('codeResult');
        this.focusBox = document.querySelector('.focus-box');

        this.openCameraBtn?.addEventListener('click', this.startCamera.bind(this));
        this.closeCameraBtn?.addEventListener('click', this.stopCamera.bind(this));
        this.flashLightBtn?.addEventListener('click', this.toggleFlashLight.bind(this));
        this.changeCameraBtn?.addEventListener('click', this.toggleCamera.bind(this));

        const flashLightBtnAnimation = document.getElementById('flash-light-btn');
        flashLightBtnAnimation?.addEventListener('click', this.toggleFlashAnimation.bind(this));

        setInterval(this.updateIndicator.bind(this), 1000);
    }

    startCamera() {
        if (!('BarcodeDetector' in window)) {
            console.error('Barcode detection is not supported in this browser.');
            alert('Barcode detection is not supported in this browser.');
            return;
        }

        this.barcodeDetector = new BarcodeDetector();

        const facingMode = this.isFrontCamera ? "user" : "environment";
        const constraints = {
            video: {
                facingMode: facingMode,
                torch: false
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                this.video.srcObject = stream;
                this.video.play();

                this.openCameraBtn.style.display = 'none';
                this.closeCameraBtn.style.display = 'inline-block';
                this.flashLightBtn.style.display = 'inline-block';
                this.changeCameraBtn.style.display = 'inline-block';
                this.focusBox.style.display = 'block';

                this.startInterval();

                this.video.addEventListener('play', () => {
                    const $this = this.video;
                    const loop = () => {
                        if (!$this.paused && !$this.ended) {
                            CodeReader.preprocessImage($this);
                            setTimeout(loop, 1000 / 30);
                        }
                    };
                    loop();
                }, { once: true });
            })
            .catch(err => {
                console.error('Camera access error:', err);
                alert('Error accessing camera. Please make sure you have granted access to the camera and reload the page.');
            });
    }

    stopCamera() {
        if (!this.video.srcObject) return;

        const stream = this.video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());

        this.video.srcObject = null;
        clearInterval(this.timer);

        this.openCameraBtn.style.display = 'inline-block';
        this.closeCameraBtn.style.display = 'none';
        this.flashLightBtn.style.display = 'none';
        this.changeCameraBtn.style.display = 'none';
        this.focusBox.style.display = 'none';
    }

    toggleFlashLight() {
        if (this.flashLightOn) {
            this.turnOffFlashLight();
        } else {
            this.turnOnFlashLight();
        }
    }

    turnOnFlashLight() {
        this.flashLightOn = true;
        const tracks = this.video.srcObject?.getTracks();
        tracks?.forEach(track => {
            if (track.kind === 'video') {
                track.applyConstraints({ advanced: [{ torch: true }] }).catch(console.warn);
            }
        });
    }

    turnOffFlashLight() {
        this.flashLightOn = false;
        const tracks = this.video.srcObject?.getTracks();
        tracks?.forEach(track => {
            if (track.kind === 'video') {
                track.applyConstraints({ advanced: [{ torch: false }] }).catch(console.warn);
            }
        });
    }

    startInterval() {
        this.timer = setInterval(() => {
            CodeReader.preprocessImage(this.video);
            this.scanBarcode();
        }, 500);
    }

    static preprocessImage(video) {
        const frameCanvas = document.getElementById('frame');
        const ctx = frameCanvas?.getContext('2d');
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!ctx || width === 0 || height === 0) return;

        frameCanvas.width = width;
        frameCanvas.height = height;

        ctx.drawImage(video, 0, 0, width, height);

        if ('BarcodeDetector' in window) {
            const barcodeDetector = new BarcodeDetector();
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
                .catch(error => console.error('Barcode detection error:', error));
        }
    }

    toggleCamera() {
        this.isFrontCamera = !this.isFrontCamera;
        this.stopCamera();
        this.startCamera();

        this.changeCameraBtn.innerText = this.isFrontCamera ? 'Front Cam' : 'Face Cam';
    }

    updateIndicator() {
        if (!this.barcodeDetector || !this.video) return;

        this.barcodeDetector.detect(this.video)
            .then(barcodes => {
                if (barcodes.length > 0) {
                    this.indicatorText.textContent = 'Detected';
                    this.indicatorText.style.color = 'green';
                    this.codeResult.value = barcodes[0].rawValue;
                } else {
                    this.indicatorText.textContent = 'Ready';
                    this.indicatorText.style.color = 'blue';
                }
            })
            .catch(error => {
                console.error('Barcode detection error:', error);
                this.indicatorText.textContent = 'Idle';
                this.indicatorText.style.color = 'red';
            });
    }

    scanBarcode() {
        if (!this.barcodeDetector || !this.video) return;

        this.barcodeDetector.detect(this.video)
            .then(barcodes => {
                if (barcodes.length > 0) {
                    const scannedData = barcodes[0].rawValue;
                    this.scanResultElement.innerText = "Barcode detected: " + scannedData;
                    this.codeResult.value = scannedData;
                    if (typeof searchProduct === 'function') searchProduct(scannedData);
                    if (typeof updateButtonVisibility === 'function') updateButtonVisibility();
                } else {
                    this.scanResultElement.innerText = "";
                }
            })
            .catch(err => console.error('Barcode detection error:', err));
    }

    toggleFlashAnimation() {
        const flashImage = document.getElementById('flash-light-img');
        if (!flashImage) return;

        flashImage.classList.toggle('flash-off');
        flashImage.src = flashImage.classList.contains('flash-off')
            ? 'icon/flashlight_on.svg'
            : 'icon/flashlight_off.svg';
    }

    static {
        window.addEventListener('DOMContentLoaded', () => {
            new CodeReader();
        });
    }
}

export default CodeReader;
