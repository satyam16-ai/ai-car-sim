const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;

  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.fillRect = ""

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawRoad(cssWidth, cssHeight);
}


window.addEventListener("resize", resizeCanvas, { passive: true });

resizeCanvas();
