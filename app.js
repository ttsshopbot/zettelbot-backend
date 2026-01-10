const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mainImg = null;
let overlayImg = null;

let overlayX = 0;
let overlayY = 0;
let rotation = 0;
let scale = 1;
let opacity = 1;
let blurAmount = 0;
let burnAmount = 0;

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

/* REGELER */
rotate.oninput = e => { rotation = e.target.value; draw(); };
scaleInput = document.getElementById("scale");
scaleInput.oninput = e => { scale = e.target.value; draw(); };
opacityInput = document.getElementById("opacity");
opacityInput.oninput = e => { opacity = e.target.value; draw(); };
blurInput = document.getElementById("blur");
blurInput.oninput = e => { blurAmount = e.target.value; draw(); };
burnInput = document.getElementById("burn");
burnInput.oninput = e => { burnAmount = e.target.value; draw(); };

function draw() {
  if (!mainImg) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(mainImg,0,0);

  if (!overlayImg) return;

  const temp = document.createElement("canvas");
  temp.width = overlayImg.width;
  temp.height = overlayImg.height;
  const tctx = temp.getContext("2d");

  // BLUR
  tctx.filter = `blur(${blurAmount}px)`;
  tctx.drawImage(overlayImg,0,0);
  tctx.filter = "none";

  const imgData = tctx.getImageData(0,0,temp.width,temp.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i+1];
    const b = d[i+2];

    // Weiß entfernen
    if (r > 230 && g > 230 && b > 230) {
      d[i+3] = 0;
      continue;
    }

    // Transparenz
    d[i+3] *= opacity;

    // Papier-Einbrennen (Fakecheck-Look)
    if (burnAmount > 0) {
      const noise = (Math.random() - 0.5) * 40 * burnAmount;
      d[i] += noise;
      d[i+1] += noise;
      d[i+2] += noise;
    }
  }

  tctx.putImageData(imgData,0,0);

  ctx.save();
  ctx.translate(overlayX,overlayY);
  ctx.rotate(rotation * Math.PI/180);
  ctx.scale(scale,scale);
  ctx.drawImage(temp,-temp.width/2,-temp.height/2);
  ctx.restore();
}

/* DRAG */
let dragging = false;
canvas.addEventListener("pointerdown",()=>dragging=true);
canvas.addEventListener("pointerup",()=>dragging=false);
canvas.addEventListener("pointerleave",()=>dragging=false);
canvas.addEventListener("pointermove",e=>{
  if(!dragging) return;
  const r = canvas.getBoundingClientRect();
  overlayX = (e.clientX - r.left) * (canvas.width / r.width);
  overlayY = (e.clientY - r.top) * (canvas.height / r.height);
  draw();
});

/* DOWNLOAD */
function downloadImage() {
  canvas.toBlob(b=>{
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "final.png";
    a.click();
  });
}

/* DARK MODE */
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

