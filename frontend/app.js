// Configuration
const API_URL = 'https://kind-cycles-lay.loca.lt/api';
const PAYSTACK_PUBLIC_KEY = 'pk_test_7a9ad8da00db0a93e3dabf0a105c09025c03cc99';

// State
let selectedFile = null;
let paymentReference = null;

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFile');
const formatSelector = document.getElementById('formatSelector');
const targetFormat = document.getElementById('targetFormat');
const proceedPaymentBtn = document.getElementById('proceedPayment');
const stripePaymentBtn = document.getElementById('stripePayment');
const downloadFileBtn = document.getElementById('downloadFile');

// Formats supportés
const formats = {
    images: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'],
    documents: ['pdf', 'docx', 'txt', 'html', 'md'],
    audio: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'webm']
};

// Upload zone click
uploadZone.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary)';
    uploadZone.style.background = 'rgba(99, 102, 241, 0.1)';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'var(--border)';
    uploadZone.style.background = 'transparent';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--border)';
    uploadZone.style.background = 'transparent';
    
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// Handle file selection
function handleFileSelect(file) {
    // Vérifier la taille (50MB max)
    if (file.size > 50 * 1024 * 1024) {
        alert('Fichier trop volumineux. Maximum 50MB.');
        return;
    }

    selectedFile = file;
    
    // Afficher les infos du fichier
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    uploadZone.classList.add('hidden');
    filePreview.classList.remove('hidden');
    formatSelector.classList.remove('hidden');
    
    // Populate format options
    populateFormatOptions(file);
}

// Remove file
removeFileBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    uploadZone.classList.remove('hidden');
    filePreview.classList.add('hidden');
    formatSelector.classList.add('hidden');
    targetFormat.innerHTML = '<option value="">Choisir un format...</option>';
});

// Populate format options based on file type
function populateFormatOptions(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    targetFormat.innerHTML = '<option value="">Choisir un format...</option>';
    
    // Déterminer les formats compatibles
    let compatibleFormats = [];
    
    if (formats.images.includes(ext)) {
        compatibleFormats = formats.images.filter(f => f !== ext);
    } else if (formats.documents.includes(ext)) {
        compatibleFormats = formats.documents.filter(f => f !== ext);
    } else if (formats.audio.includes(ext)) {
        compatibleFormats = formats.audio.filter(f => f !== ext);
    } else if (formats.video.includes(ext)) {
        compatibleFormats = formats.video.filter(f => f !== ext);
    }
    
    compatibleFormats.forEach(format => {
        const option = document.createElement('option');
        option.value = format;
        option.textContent = format.toUpperCase();
        targetFormat.appendChild(option);
    });
}

// Enable payment button when format selected
targetFormat.addEventListener('change', () => {
    proceedPaymentBtn.disabled = !targetFormat.value;
});

// Proceed to payment
proceedPaymentBtn.addEventListener('click', async () => {
    if (!selectedFile || !targetFormat.value) {
        return;
    }
    
    showStep('step-payment');
});

// Paystack payment
stripePaymentBtn.addEventListener('click', async () => {
    try {
        const email = prompt("Veuillez entrer votre email pour le reçu:", "customer@example.com");
        if (!email) return;

        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: email,
            amount: 65000, // 650 XOF
            currency: 'XOF',
            ref: 'FC-' + Math.floor((Math.random() * 1000000000) + 1),
            callback: function(response) {
                paymentReference = response.reference;
                showStep('step-processing');
                convertFile();
            },
            onClose: function() {
                alert('Transaction annulée.');
            }
        });
        handler.openIframe();
    } catch (error) {
        console.error('Payment error:', error);
        alert('Erreur lors du paiement');
    }
});

// Check payment on page load (après retour de Stripe)
window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        paymentSessionId = sessionId;
        
        try {
            // Vérifier le paiement
            const response = await fetch(`${API_URL}/verify-payment/${sessionId}`);
            const { paid } = await response.json();
            
            if (paid) {
                // Paiement réussi, demander le fichier
                if (!selectedFile) {
                    alert('Veuillez resélectionner votre fichier');
                    window.location.href = '/';
                    return;
                }
                
                showStep('step-processing');
                await convertFile();
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Erreur lors de la vérification du paiement');
        }
    }
});

// Convert file
async function convertFile() {
    if (!selectedFile || !targetFormat.value || !paymentReference) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('targetFormat', targetFormat.value);
        formData.append('paymentReference', paymentReference);
        
        const response = await fetch(`${API_URL}/convert`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error('Conversion failed');
        }
        
        // Télécharger le fichier converti
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        downloadFileBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted.${targetFormat.value}`;
            a.click();
        };
        
        showStep('step-download');
    } catch (error) {
        console.error('Conversion error:', error);
        alert('Erreur lors de la conversion');
        showStep('step-upload');
    }
}

// Show specific step
function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
