const canvas = document.getElementById("gameCanvas");
canvas.height = window.innerHeight;

const laneCount = 10;
const laneWidth = 60;
canvas.width = laneCount * laneWidth;

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9, laneCount);

const car = new Car(road.getLaneCenter(1) - 15, 100, 30, 50);

// Generate random traffic
function generateTraffic() {
    const traffic = [];
    const lanes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const trafficCount = 15;
    const spacing = 200;
    
    for (let i = 0; i < trafficCount; i++) {
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const y = -100 - i * spacing - Math.random() * 200;
        const speed = 1 + Math.random() * 2;
        traffic.push(
            new Car(road.getLaneCenter(lane) - 15, y, 30, 50, "DUMMY", speed)
        );
    }
    
    return traffic;
}

const traffic = generateTraffic();

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
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    car.update(road.borders, traffic);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);
    
    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx);
    }
    car.draw(ctx);
    
    ctx.restore();
    
    requestAnimationFrame(animatetion);
}

