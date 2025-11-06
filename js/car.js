class Car {
    constructor(x, y, width, height, controlType = "KEYS", maxSpeed = 3) {
        this.x = x - width / 2;  // Center the car on x position
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.acceleration = 0.2;
        this.friction = 0.05;
        this.maxSpeed = maxSpeed;
        this.angle = 0;
        this.flip = 1;
        this.damaged = false;
        this.fitness = 0;  // Fitness score for training
        
        this.controlType = controlType;
        this.useBrain = controlType === "AI";
        
        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this);
            if (this.useBrain) {
                this.brain = new Network(
                    [this.sensor.rayCount, 10, 4]  // More hidden neurons for better learning
                );
                // Bias the output layer towards forward movement
                if (this.brain.levels.length > 0) {
                    const outputLevel = this.brain.levels[this.brain.levels.length - 1];
                    outputLevel.biases[0] = -0.5;  // Forward bias (easier to activate)
                    outputLevel.biases[1] = 0.3;   // Left (harder to activate)
                    outputLevel.biases[2] = 0.3;   // Right (harder to activate)
                    outputLevel.biases[3] = 0.8;   // Reverse (much harder)
                }
            }
        }
        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic = []) {
        if (!this.damaged) {
            this.#moment();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            if (this.useBrain && !this.damaged) {
                const offsets = this.sensor.readings.map(
                    s => s == null ? 0 : 1 - s.offset
                );
                const outputs = Network.feedForward(offsets, this.brain);
                
                // Analyze sensor readings for smart behavior
                const frontClear = this.#isFrontClear(offsets);
                const leftClear = this.#isSideClear(offsets, 'left');
                const rightClear = this.#isSideClear(offsets, 'right');
                
                // Reset all controls first
                this.controls.forward = outputs[0];
                this.controls.left = 0;
                this.controls.right = 0;
                this.controls.reverse = outputs[3];
                
                // If front blocked but sides are clear, prefer changing lanes
                if (!frontClear && (leftClear || rightClear)) {
                    if (leftClear && rightClear) {
                        // Both sides clear, use neural network decision
                        if (outputs[1] > outputs[2]) {
                            this.controls.left = 1;
                        } else if (outputs[2] > outputs[1]) {
                            this.controls.right = 1;
                        }
                    } else if (leftClear) {
                        this.controls.left = 1;
                    } else if (rightClear) {
                        this.controls.right = 1;
                    }
                } else {
                    // Normal neural network control - only strongest direction
                    if (outputs[1] === 1 && outputs[2] === 1) {
                        // Both want to activate, pick randomly to break tie
                        if (Math.random() > 0.5) {
                            this.controls.left = 1;
                        } else {
                            this.controls.right = 1;
                        }
                    } else if (outputs[1] === 1) {
                        this.controls.left = 1;
                    } else if (outputs[2] === 1) {
                        this.controls.right = 1;
                    }
                }
                
                // Increase speed when path is clear
                if (frontClear) {
                    this.maxSpeed = 3.5;  // Boost speed
                } else {
                    this.maxSpeed = 2;    // Slow down when obstacle ahead
                }
            }
        }
    }
    
    #isFrontClear(offsets) {
        // Check center sensors (middle 40% of sensors)
        const centerStart = Math.floor(offsets.length * 0.3);
        const centerEnd = Math.floor(offsets.length * 0.7);
        
        for (let i = centerStart; i < centerEnd; i++) {
            if (offsets[i] > 0.5) {  // Obstacle detected (close)
                return false;
            }
        }
        return true;
    }
    
    #isSideClear(offsets, side) {
        // Check left or right sensors
        let start, end;
        if (side === 'left') {
            start = 0;
            end = Math.floor(offsets.length * 0.3);
        } else {
            start = Math.floor(offsets.length * 0.7);
            end = offsets.length;
        }
        
        for (let i = start; i < end; i++) {
            if (offsets[i] > 0.3) {  // Obstacle detected
                return false;
            }
        }
        return true;
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

    #assessDamage(roadBorders, traffic = []) {
        // Check collision with road borders (convert line segments to thin polygons)
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        
        // Check collision with traffic cars
        for (let i = 0; i < traffic.length; i++) {
            if (traffic[i].polygon && polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
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


    draw(ctx, color, drawSensor = false) {
        if (this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = color;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        if (!this.damaged) {
            ctx.fillStyle = "white";
            ctx.fillRect(-this.width / 2 + 3, -this.height / 2, this.width - 6, this.height * 0.3);

            ctx.fillStyle = "black";
            ctx.fillRect(-this.width / 2 - 2, -this.height / 2 + 5, 2, this.height * 0.25);
            
            ctx.fillRect(this.width / 2, -this.height / 2 + 5, 2, this.height * 0.25);

            ctx.fillRect(-this.width / 2 - 2, this.height / 2 - 5 - this.height * 0.25, 2, this.height * 0.25);
            
            ctx.fillRect(this.width / 2, this.height / 2 - 5 - this.height * 0.25, 2, this.height * 0.25);
        }

        ctx.restore();
        
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
    
}