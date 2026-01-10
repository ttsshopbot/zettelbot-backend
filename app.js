const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mainImg = null;
let overlayImg = null;

let overlayX = 0;
let overlayY = 0;
let rotation = 0;
let scale = 1;
let blurAmount = 0;
let paperStrength = 0.4;

const mainInput = document.getElementById("mainInput");
const overlayInput = document.getElementById("overlayInput");

mainInput.onchange = e => loadImage(e.target.files[0], img => {
  mainImg = img;
  canvas.width = img.width;
  canvas.height = img.height;
  overlayX = canvas.width / 2;
  overlayY = canvas.height / 2;
  draw();
});

overlayInput.onchange = e => loadImage(e.target.files[0], img => {
  overlayImg = img;
  draw();
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

document.getElementById("blur").oninput = e => {
  blurAmount = e.target.value;
  draw();
};

document.getElementById("paper").oninput = e => {
  paperStrength = e.target.value;
  draw();
};

function draw() {
  if (!mainImg) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(mainImg, 0, 0);

  if (!overlayImg) return;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = overlayImg.width;
  tempCanvas.height = overlayImg.height;
  const tctx = tempCanvas.getContext("2d");

  tctx.drawImage(overlayImg, 0, 0);

  const imgData = tctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Weißes Papier entfernen
    if (r > 230 && g > 230 && b > 230) {
      data[i + 3] = 0;
    } else {
      // Papier-Einbrennen
      const darkness = (r + g + b) / 3 / 255;
      data[i] *= (1 - paperStrength * (1 - darkness));
      data[i + 1] *= (1 - paperStrength * (1 - darkness));
      data[i + 2] *= (1 - paperStrength * (1 - darkness));
    }
  }

  tctx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.translate(overlayX, overlayY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.scale(scale, scale);
  ctx.filter = `blur(${blurAmount}px)`;
  ctx.drawImage(
    tempCanvas,
    -tempCanvas.width / 2,
    -tempCanvas.height / 2
  );
  ctx.restore();
}

/* DRAG */
let dragging = false;

canvas.addEventListener("pointerdown", () => dragging = true);

canvas.addEventListener("pointermove", e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  overlayX = (e.clientX - rect.left) * (canvas.width / rect.width);
  overlayY = (e.clientY - rect.top) * (canvas.height / rect.height);
  draw();
});

canvas.addEventListener("pointerup", () => dragging = false);
canvas.addEventListener("pointerleave", () => dragging = false);

/* DOWNLOAD */
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

