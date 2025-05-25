document.addEventListener("DOMContentLoaded", () => {
    // Tab switching
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        const targetTab = trigger.dataset.tab;
        
        tabTriggers.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        trigger.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
    });

    // Image upload functionality
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const imageName = document.getElementById('imageName');
    const removeImage = document.getElementById('removeImage');
    const imageSubmitBtn = document.getElementById('imageSubmitBtn');
    const imageForm = document.getElementById('imageForm');

    let selectedImage = null;

    uploadArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageSelect);

    uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        imageInput.files = files;
        handleImageSelect();
    }
    });

    function handleImageSelect() {
    const file = imageInput.files[0];
    if (!file) {
        resetImageUpload();
        return;
    }

    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    selectedImage = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imageName.textContent = file.name;
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
        imageSubmitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    }

    removeImage.addEventListener('click', resetImageUpload);

    function resetImageUpload() {
    selectedImage = null;
    imageInput.value = '';
    uploadArea.style.display = 'block';
    imagePreview.style.display = 'none';
    imageSubmitBtn.disabled = true;
    }

    // Coordinates form
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const coordinatesSubmitBtn = document.getElementById('coordinatesSubmitBtn');
    const coordinatesForm = document.getElementById('coordinatesForm');

    function validateCoordinates() {
    const lat = latitudeInput.value.trim();
    const lon = longitudeInput.value.trim();
    coordinatesSubmitBtn.disabled = !(lat && lon);
    }

    latitudeInput.addEventListener('input', validateCoordinates);
    longitudeInput.addEventListener('input', validateCoordinates);

    // Form submissions
    imageForm.addEventListener('submit', handleImageSubmit);
    coordinatesForm.addEventListener('submit', handleCoordinatesSubmit);

    async function handleImageSubmit(e) {
    e.preventDefault();
    if (!selectedImage) return;

    setLoadingState(imageSubmitBtn, true, 'Extracting...');
    hideResults();

    // Mock API call - replace with actual endpoint
    try {
        // Simulated response for demonstration
        setTimeout(() => {
        const mockData = {
            source: "Image EXIF Data",
            dms: {
            latitude: "36° 1'44.03\"S",
            longitude: "146°30'13.41\"E"
            },
            decimal: {
            latitude: "-36.02889",
            longitude: "146.50373"
            },
            dms_line: "36° 1'44.03\"S, 146°30'13.41\"E",
            map_links: {
            google_maps: "https://maps.google.com/?q=-36.02889,146.50373",
            google_earth: "https://earth.google.com/web/search/-36.02889,146.50373"
            }
        };
        displayResults(mockData);
        setLoadingState(imageSubmitBtn, false);
        }, 2000);
    } catch (error) {
        displayError(error.message);
        setLoadingState(imageSubmitBtn, false);
    }
    }

    async function handleCoordinatesSubmit(e) {
    e.preventDefault();
    
    const lat = latitudeInput.value.trim();
    const lon = longitudeInput.value.trim();
    
    if (!lat || !lon) return;

    setLoadingState(coordinatesSubmitBtn, true, 'Converting...');
    hideResults();

    // Mock conversion - replace with actual logic
    try {
        setTimeout(() => {
        const mockData = {
            source: "Manual DMS Input",
            dms: {
            latitude: lat,
            longitude: lon
            },
            decimal: {
            latitude: "40.7589",
            longitude: "-73.9851"
            },
            dms_line: `${lat}, ${lon}`,
            map_links: {
            google_maps: "https://maps.google.com/?q=40.7589,-73.9851",
            google_earth: "https://earth.google.com/web/search/40.7589,-73.9851"
            }
        };
        displayResults(mockData);
        setLoadingState(coordinatesSubmitBtn, false);
        }, 1500);
    } catch (error) {
        displayError(error.message);
        setLoadingState(coordinatesSubmitBtn, false);
    }
    }

    function setLoadingState(button, loading, text = 'Loading...') {
    if (loading) {
        button.innerHTML = `<div class="loading-spinner"></div>${text}`;
        button.disabled = true;
    } else {
        if (button.id === 'imageSubmitBtn') {
        button.innerHTML = '<i class="fas fa-search"></i> Extract Coordinates';
        button.disabled = !selectedImage;
        } else {
        button.innerHTML = '<i class="fas fa-calculator"></i> Convert to Decimal';
        validateCoordinates();
        }
    }
    }

    // Results functionality
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const resultsContent = document.getElementById('resultsContent');
    const mapLinks = document.getElementById('mapLinks');
    const googleMapsBtn = document.getElementById('googleMapsBtn');
    const googleEarthBtn = document.getElementById('googleEarthBtn');

    function hideResults() {
    resultsPlaceholder.style.display = 'block';
    resultsContent.style.display = 'none';
    mapLinks.style.display = 'none';
    }

    function displayResults(data) {
    const html = `
        <div class="result-item">
        <div class="result-label">
            <i class="fas fa-info-circle"></i>
            Source
        </div>
        <div class="result-value">
            ${data.source}
            <button class="copy-btn" onclick="copyToClipboard('${data.source}', this)">
            <i class="fas fa-copy"></i>
            </button>
        </div>
        </div>

        <div class="result-item">
        <div class="result-label">
            <i class="fas fa-compass"></i>
            DMS Format
        </div>
        <div class="coordinate-pair">
            <div class="result-value">
            Lat: ${data.dms.latitude}
            <button class="copy-btn" onclick="copyToClipboard('${data.dms.latitude}', this)">
                <i class="fas fa-copy"></i>
            </button>
            </div>
        </div>
        <div class="coordinate-pair">
            <div class="result-value">
            Lon: ${data.dms.longitude}
            <button class="copy-btn" onclick="copyToClipboard('${data.dms.longitude}', this)">
                <i class="fas fa-copy"></i>
            </button>
            </div>
        </div>
        </div>

        <div class="result-item">
        <div class="result-label">
            <i class="fas fa-crosshairs"></i>
            Decimal Format
        </div>
        <div class="coordinate-pair">
            <div class="result-value">
            Lat: ${data.decimal.latitude}
            <button class="copy-btn" onclick="copyToClipboard('${data.decimal.latitude}', this)">
                <i class="fas fa-copy"></i>
            </button>
            </div>
        </div>
        <div class="coordinate-pair">
            <div class="result-value">
            Lon: ${data.decimal.longitude}
            <button class="copy-btn" onclick="copyToClipboard('${data.decimal.longitude}', this)">
                <i class="fas fa-copy"></i>
            </button>
            </div>
        </div>
        </div>

        <div class="result-item">
        <div class="result-label">
            <i class="fas fa-map-marker-alt"></i>
            Complete DMS Line
        </div>
        <div class="result-value">
            ${data.dms_line}
            <button class="copy-btn" onclick="copyToClipboard('${data.dms_line}', this)">
            <i class="fas fa-copy"></i>
            </button>
        </div>
        </div>
    `;

    resultsContent.innerHTML = html;
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display = 'block';

    // Setup map buttons
    if (data.map_links?.google_maps) {
        googleMapsBtn.onclick = () => window.open(data.map_links.google_maps, '_blank');
        mapLinks.style.display = 'block';
    }

    if (data.map_links?.google_earth) {
        googleEarthBtn.onclick = () => window.open(data.map_links.google_earth, '_blank');
        mapLinks.style.display = 'block';
    }
    }

    function displayError(message) {
    const errorHtml = `
        <div class="error-result">
        <i class="fas fa-exclamation-triangle"></i>
        Error: ${message}
        </div>
    `;
    
    resultsContent.innerHTML = errorHtml;
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display = 'block';
    }

    // Global copy function
    window.copyToClipboard = function(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('copied');
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
    };
});