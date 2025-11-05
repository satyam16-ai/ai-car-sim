const canvas = document.getElementById("gameCanvas");
canvas.height = window.innerHeight;
canvas.width = 200;

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width, 4);

const car = new Car(100, 100, 30, 50);
car.draw(ctx);
animatetion();
function animatetion() {
    car.update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    road.draw(ctx);

    car.draw(ctx);
    requestAnimationFrame(animatetion);
}

