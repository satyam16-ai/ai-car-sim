const canvas = document.getElementById("gameCanvas");
canvas.height = window.innerHeight;
canvas.width = 200;

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width, 4);

const car = new Car(road.getLaneCenter(1) - 15, 100, 30, 50);

document.getElementById("maxSpeed").addEventListener("input", (e) => {
    car.maxSpeed = parseFloat(e.target.value);
    document.getElementById("maxSpeedValue").textContent = e.target.value;
});

document.getElementById("acceleration").addEventListener("input", (e) => {
    car.acceleration = parseFloat(e.target.value);
    document.getElementById("accelerationValue").textContent = e.target.value;
});

document.getElementById("friction").addEventListener("input", (e) => {
    car.friction = parseFloat(e.target.value);
    document.getElementById("frictionValue").textContent = e.target.value;
});

animatetion();
function animatetion() {
    car.update();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);
    
    road.draw(ctx);
    car.draw(ctx);
    
    ctx.restore();
    
    requestAnimationFrame(animatetion);
}

