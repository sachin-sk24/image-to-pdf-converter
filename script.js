
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const convertBtn = document.getElementById('convertBtn');
const compressionSelect = document.getElementById('compression');

// Initialize Google AdSense
(adsbygoogle = window.adsbygoogle || []).push({});

let selectedImages = [];

// Handle drag and drop
document.querySelector('.upload-section').addEventListener('dragover', (e) => {
  e.preventDefault();
  e.target.classList.add('drag-over');
});

document.querySelector('.upload-section').addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.target.classList.remove('drag-over');
});

document.querySelector('.upload-section').addEventListener('drop', (e) => {
  e.preventDefault();
  e.target.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  handleFiles(files);
});

imageInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  selectedImages = [];
  imagePreview.innerHTML = '';

  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImages.push(e.target.result);
        const img = document.createElement('img');
        img.src = e.target.result;
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
}

convertBtn.addEventListener('click', async () => {
  if (selectedImages.length === 0) {
    alert('Please select at least one image');
    return;
  }

  const compressionLevel = parseFloat(compressionSelect.value);
  const pdf = new jspdf.jsPDF();
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  try {
    for (let i = 0; i < selectedImages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const img = new Image();
      img.src = selectedImages[i];
      await new Promise(resolve => {
        img.onload = () => {
          const imgProps = pdf.getImageProperties(img);
          const ratio = Math.min(
            pdfWidth / imgProps.width,
            pdfHeight / imgProps.height
          );
          const width = imgProps.width * ratio;
          const height = imgProps.height * ratio;
          const x = (pdfWidth - width) / 2;
          const y = (pdfHeight - height) / 2;

          pdf.addImage(
            img,
            'JPEG',
            x,
            y,
            width,
            height,
            undefined,
            'MEDIUM',
            compressionLevel
          );
          resolve();
        };
      });
    }

    pdf.save('converted-images.pdf');
  } catch (error) {
    console.error('Error converting images:', error);
    alert('Error converting images to PDF. Please try again.');
  }
});
