class Sensor { 
    constructor(car) {
        this.car = car;
        this.rayCount = 10;
        this.rayLength = 150;
        this.raySpread = Math.PI;  // Wider spread to see side lanes better
        this.rays = [];
        this.readings = [];
        // Initialize rays immediately
        this.#castRays();
    }

    update(roadBorders, traffic = []) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(this.rays[i], roadBorders, traffic)
            );
        }
    }

    #getReading(ray, roadBorders, traffic = []) {
        let touches = [];
        
        // Check intersections with road borders
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }
        
        // Check intersections with traffic car polygons
        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;
            if (poly) {
                for (let j = 0; j < poly.length; j++) {
                    const touch = getIntersection(
                        ray[0],
                        ray[1],
                        poly[j],
                        poly[(j + 1) % poly.length]
                    );
                    if (touch) {
                        touches.push(touch);
                    }
                }
            }
        }
        
        if (touches.length == 0) {
            return null;
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset == minOffset);
        }
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;
            
            const start = { 
                x: this.car.x + this.car.width / 2, 
                y: this.car.y + this.car.height / 2 
            };
            const end = {
                x: start.x + Math.sin(rayAngle) * this.rayLength,
                y: start.y - Math.cos(rayAngle) * this.rayLength
            };
            this.rays.push([start, end]);
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            // Safety check: ensure ray exists
            if (!this.rays[i]) continue;
            
            let end = this.rays[i][1];
            if (this.readings[i]) {
                end = this.readings[i];
            }
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}