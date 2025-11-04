// Select the canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set actual drawing size (important!)
canvas.width = 800;
canvas.height = 600;

// Function to draw road layout
function drawRoad() {
  // Draw the main road (gray rectangle)
  ctx.fillStyle = "#4d4d4d";
  ctx.fillRect(250, 0, 300, 600);

  // Draw lane lines (white dashed lines)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 15]); // dash pattern
  ctx.beginPath();
  ctx.moveTo(400, 0);
  ctx.lineTo(400, 600);
  ctx.stroke();

  // Road edges
  ctx.setLineDash([]); // solid lines again
  ctx.strokeStyle = "#yellow";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(250, 600);
  ctx.moveTo(550, 0);
  ctx.lineTo(550, 600);
  ctx.stroke();
}

// Initial draw
drawRoad();
