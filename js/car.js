class Car {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.acceleration = 0.2;
        this.friction = 0.05;
        this.maxSpeed = 3;
        this.angle = 0;
        this.controls = new Controls();
    }

    update() {
        // Handle acceleration
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        // Clamp speed to max values
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        // Apply friction
        if (Math.abs(this.speed) > this.friction) {
            if (this.speed > 0) {
                this.speed -= this.friction;
            } else if (this.speed < 0) {
                this.speed += this.friction;
            }
        } else {
            this.speed = 0;
        }

        // Determine steering direction based on forward/reverse
        const flip = this.speed > 0 ? 1 : -1;

        // Only allow turning when moving
        if (Math.abs(this.speed) > 0.5) {
            if (this.controls.left) {
                this.angle -= 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle += 0.03 * flip;
            }
        }

        // Update position based on angle and speed
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }


    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        // Car body
        ctx.fillStyle = "#3498db";
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Windshield (front indicator)
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(-this.width / 2 + 3, -this.height / 2, this.width - 6, this.height * 0.3);

        // Left wheel
        ctx.fillStyle = "#34495e";
        ctx.fillRect(-this.width / 2 - 2, -this.height / 2 + 5, 2, this.height * 0.25);
        
        // Right wheel
        ctx.fillRect(this.width / 2, -this.height / 2 + 5, 2, this.height * 0.25);

        // Left rear wheel
        ctx.fillRect(-this.width / 2 - 2, this.height / 2 - 5 - this.height * 0.25, 2, this.height * 0.25);
        
        // Right rear wheel
        ctx.fillRect(this.width / 2, this.height / 2 - 5 - this.height * 0.25, 2, this.height * 0.25);

        ctx.restore();
    }
    
}