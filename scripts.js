// Track usage count
let usageCount = localStorage.getItem('usageCount') || 0;
const freeUsageLimit = 3;

// Track payment status
let paymentApproved = localStorage.getItem('paymentApproved') === 'true';

// Handle drag and drop
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('imageUpload');
const paymentSection = document.getElementById('paymentSection');
const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        fileInput.files = e.dataTransfer.files;
        handleFileUpload(file);
    }
});

// Handle file input
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// Handle file upload
function handleFileUpload(file) {
    if (usageCount >= freeUsageLimit && !paymentApproved) {
        paymentSection.style.display = 'block';
        removeBackgroundBtn.disabled = true;
        alert('You have reached the free usage limit. Please make a payment to continue.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const originalImage = document.getElementById('originalImage');
        originalImage.src = e.target.result;
        originalImage.style.display = 'block';
        removeBackgroundBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// Handle background removal
removeBackgroundBtn.addEventListener('click', function() {
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image_file', file);

        // API details
        const apiUrl = 'https://api.remove.bg/v1.0/removebg';
        const apiKey = 'NtzuPYeFK21SzqNaU4HWtrw5';

        // Show loading state
        removeBackgroundBtn.textContent = 'Processing...';
        removeBackgroundBtn.disabled = true;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('API request failed');
            }
            return response.blob(); // Get the processed image as a Blob
        })
        .then(blob => {
            const processedImage = document.getElementById('processedImage');
            processedImage.src = URL.createObjectURL(blob); // Display the processed image
            processedImage.style.display = 'block';

            // Enable the download button
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.style.display = 'inline-block';
            downloadBtn.onclick = function() {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'processed-image.png'; // Default filename
                link.click();
            };

            // Increment usage count
            usageCount++;
            localStorage.setItem('usageCount', usageCount);

            // Check if usage limit is reached
            if (usageCount >= freeUsageLimit && !paymentApproved) {
                paymentSection.style.display = 'block';
                removeBackgroundBtn.disabled = true;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        })
        .finally(() => {
            removeBackgroundBtn.textContent = 'Remove Background';
            removeBackgroundBtn.disabled = false;
        });
    }
});

// Handle receipt upload
document.getElementById('submitReceiptBtn').addEventListener('click', function() {
    const receiptFile = document.getElementById('receiptUpload').files[0];
    if (receiptFile) {
        alert('Receipt submitted. Your payment will be verified shortly.');

        // Implement payment verification logic here
        const reader = new FileReader();
        reader.onload = function(e) {
            const receiptImage = e.target.result;

            // Actual verification logic
            const apiUrl = 'https://api.paymentprovider.com/verify'; // Replace with actual API endpoint
            const apiKey = 'your-api-key'; // Replace with your API key

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    receipt_image: receiptImage,
                    amount: 100 // or 500, depending on the user's payment plan
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Payment verification failed');
                }
                return response.json();
            })
            .then(data => {
                if (data.verified) {
                    paymentApproved = true;
                    localStorage.setItem('paymentApproved', 'true');
                    paymentSection.style.display = 'none';
                    removeBackgroundBtn.disabled = false;
                    alert('Payment approved! You can now continue using the tool.');
                } else {
                    alert('Payment verification failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Payment verification error:', error);
                alert('An error occurred during payment verification. Please try again.');
            });
        };
        reader.readAsDataURL(receiptFile);
    } else {
        alert('Please upload your transaction receipt.');
    }
});

// Handle pricing buttons
document.getElementById('buy10Uses').addEventListener('click', function() {
    alert('Please pay 100 ETB via Telebirr (0929570426) or CBE Account (1000582835048) and upload your receipt.');
});

document.getElementById('buyUnlimited').addEventListener('click', function() {
    alert('Please pay 500 ETB via Telebirr (0929570426) or CBE Account (1000582835048) and upload your receipt.');
});
