class Car {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.acceleration = 0.2;
        this.friction = 0.05;
        this.maxSpeed = 5;
        this.angle = 0;
        this.flip = 1;
        this.damaged = false;
        this.controls = new Controls();
        this.sensor = new Sensor(this);
    }

    update(roadBorders) {
        if (!this.damaged) {
            this.#moment();
        }
        this.polygon = this.#createPolygon();
        this.damaged = this.#assessDamage(roadBorders);
        this.sensor.update(roadBorders);
    }
    #createPolygon() {
        const points = [];
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        
        // Adjust for the car's center point (matching the draw translation)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Top-left corner
        points.push({
            x: centerX + (-halfWidth * cos - (-halfHeight) * sin),
            y: centerY + (-halfWidth * sin + (-halfHeight) * cos)
        });
        // Top-right corner
        points.push({
            x: centerX + (halfWidth * cos - (-halfHeight) * sin),
            y: centerY + (halfWidth * sin + (-halfHeight) * cos)
        });
        // Bottom-right corner
        points.push({
            x: centerX + (halfWidth * cos - halfHeight * sin),
            y: centerY + (halfWidth * sin + halfHeight * cos)
        });
        // Bottom-left corner
        points.push({
            x: centerX + (-halfWidth * cos - halfHeight * sin),
            y: centerY + (-halfWidth * sin + halfHeight * cos)
        });

        return points;
    }

    #assessDamage(roadBorders) {
        for (let i = 0; i < roadBorders.length; i++) {
            // Check each edge of the car polygon against the border segment
            for (let j = 0; j < this.polygon.length; j++) {
                const touch = getIntersection(
                    this.polygon[j],
                    this.polygon[(j + 1) % this.polygon.length],
                    roadBorders[i][0],
                    roadBorders[i][1]
                );
                if (touch) {
                    return true;
                }
            }
        }
        return false;
    }

    #moment() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        if (Math.abs(this.speed) > this.friction) {
            if (this.speed > 0) {
                this.speed -= this.friction;
            } else if (this.speed < 0) {
                this.speed += this.friction;
            }
        } else {
            this.speed = 0;
        }

        if (this.speed > 0) {
            this.flip = 1;
        } else if (this.speed < 0) {
            this.flip = -1;
        }

        if (Math.abs(this.speed) > 0.5) {
            if (this.controls.left) {
                this.angle -= 0.03 * this.flip;
            }
            if (this.controls.right) {
                this.angle += 0.03 * this.flip;
            }
        }

        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }


    draw(ctx) {
        if (this.damaged) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "#3498db";
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        if (!this.damaged) {
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(-this.width / 2 + 3, -this.height / 2, this.width - 6, this.height * 0.3);

            ctx.fillStyle = "#000000ff";
            ctx.fillRect(-this.width / 2 - 2, -this.height / 2 + 5, 2, this.height * 0.25);
            
            ctx.fillRect(this.width / 2, -this.height / 2 + 5, 2, this.height * 0.25);

            ctx.fillRect(-this.width / 2 - 2, this.height / 2 - 5 - this.height * 0.25, 2, this.height * 0.25);
            
            ctx.fillRect(this.width / 2, this.height / 2 - 5 - this.height * 0.25, 2, this.height * 0.25);
        }

        ctx.restore();
        
        this.sensor.draw(ctx);
    }
    
}