const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mainImg = null;
let overlayImg = null;

let overlayX = 0;
let overlayY = 0;
let rotation = 0;
let scale = 1;

const mainInput = document.getElementById("mainInput");
const overlayInput = document.getElementById("overlayInput");

/* ================================
   NEU: WEISS → TRANSPARENT (NUR DAS)
================================ */
function removeWhiteBackground(img, callback) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = img.width;
  tempCanvas.height = img.height;

  tempCtx.drawImage(img, 0, 0);

  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = (r + g + b) / 3;

    if (brightness > 235) {
      data[i + 3] = 0; // transparent
    }
  }

  tempCtx.putImageData(imageData, 0, 0);

  const cleanedImg = new Image();
  cleanedImg.onload = () => callback(cleanedImg);
  cleanedImg.src = tempCanvas.toDataURL("image/png");
}

/* ================================ */

mainInput.onchange = e => loadImage(e.target.files[0], img => {
  mainImg = img;
  canvas.width = img.width;
  canvas.height = img.height;
  overlayX = canvas.width / 2;
  overlayY = canvas.height / 2;
  draw();
});

/* HIER EINZIGE ÄNDERUNG */
overlayInput.onchange = e => loadImage(e.target.files[0], img => {
  removeWhiteBackground(img, cleaned => {
    overlayImg = cleaned;
    draw();
  });
});

function loadImage(file, cb) {
  const img = new Image();
  img.onload = () => cb(img);
  img.src = URL.createObjectURL(file);
}

document.getElementById("rotate").oninput = e => {
  rotation = e.target.value;
  draw();
};

document.getElementById("scale").oninput = e => {
  scale = e.target.value;
  draw();
};

function draw() {
  if (!mainImg) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(mainImg,0,0);

  if (!overlayImg) return;

  ctx.save();
  ctx.translate(overlayX, overlayY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(
    overlayImg,
    -overlayImg.width/2,
    -overlayImg.height/2
  );
  ctx.restore();
}

/* DRAG */
let dragging = false;

canvas.addEventListener("pointerdown", () => {
  dragging = true;
});

canvas.addEventListener("pointermove", e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  overlayX = (e.clientX - rect.left) * (canvas.width / rect.width);
  overlayY = (e.clientY - rect.top) * (canvas.height / rect.height);
  draw();
});

canvas.addEventListener("pointerup", () => dragging = false);
canvas.addEventListener("pointerleave", () => dragging = false);

/* DOWNLOAD – FIXED FOR MOBILE */
function downloadImage() {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "final.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png", 1);
}

/* DARK MODE */
const themeBtn = document.getElementById("themeToggle");
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};
