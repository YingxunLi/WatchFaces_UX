class Metaballs {
    constructor(hThickness, hLengthRate, maxDistance, waveCount, waveSize) {
        this.hThickness = hThickness
        this.hLengthRate = hLengthRate
        this.maxDistance = maxDistance
        this.waveCount = waveCount
        this.waveSize = waveSize
    }

    draw(nodes, hue = 240, sat = 60) {
        push();
        colorMode(HSL);
        for (let wave = this.waveCount; wave >= 0; wave--) {
            let waveWidth = wave * this.waveSize;
            let waveColor = color(hue, sat, map(wave, 0, this.waveCount, 40, 90));

            for (let i = 0; i < nodes.length; i++) {
                let n = nodes[i];
                // draw metaball connections
                for (let j = i - 1; j >= 0; j--) {
                    this.drawBridge(n, nodes[j], waveWidth, waveColor);
                }
                // draw metaballs
                noStroke();
                fill(waveColor);
                ellipse(n.x, n.y, n.radius + waveWidth * 2);
            }
        }
        pop();
    }

    drawBridge(n1, n2, plusRadius = 0, color = "black") {
        angleMode(RADIANS);
        let STATUS = {
            'NOTCONNECTED': 1,
            'CONNECTED': 2,
            'INSIDE': 3,
            'OVERLAPPING': 4
        };
        let status = STATUS.CONNECTED;
        let center1 = createVector(n1.x, n1.y);
        let center2 = createVector(n2.x, n2.y);
        let radius1 = n1.radius / 2 + plusRadius;
        let radius2 = n2.radius / 2 + plusRadius;
        let d = center1.dist(center2);
        let u1, u2;

        if (radius1 <= 0 || radius2 <= 0) {
            return;
        }
        if (d - radius1 - radius2 > this.maxDistance) {
            status = STATUS.NOTCONNECTED;
        } else if (d <= Math.abs(radius1 - radius2)) {
            status = STATUS.INSIDE;
        } else if (d < radius1 + radius2) { // case circles are overlapping
            status = STATUS.OVERLAPPING;
            u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) / (2 * radius1 * d));
            u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) / (2 * radius2 * d));
        } else {
            status = STATUS.CONNECTED;
            u1 = 0;
            u2 = 0;
        }

        if (status == STATUS.CONNECTED || status == STATUS.OVERLAPPING) {
            let angle1 = p5.Vector.sub(center1, center2).heading() + Math.PI;
            let angle2 = Math.acos((radius1 - radius2) / d);

            let angle1a = angle1 + u1 + (angle2 - u1) * this.hThickness;
            let angle1b = angle1 - u1 - (angle2 - u1) * this.hThickness;
            let angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * this.hThickness;
            let angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * this.hThickness;
            let p1a = p5.Vector.add(center1, p5.Vector.fromAngle(angle1a, radius1));
            let p1b = p5.Vector.add(center1, p5.Vector.fromAngle(angle1b, radius1));
            let p2a = p5.Vector.add(center2, p5.Vector.fromAngle(angle2a, radius2));
            let p2b = p5.Vector.add(center2, p5.Vector.fromAngle(angle2b, radius2));

            // define handle length by the distance between
            // both ends of the curve to draw
            let totalRadius = radius1 + radius2;
            let d2 = Math.min(this.hThickness * this.hLengthRate, p5.Vector.sub(p1a, p2a).mag() / totalRadius);

            // case circles are overlapping:
            d2 *= Math.min(1, d * 2 / (radius1 + radius2));

            radius1 *= d2;
            radius2 *= d2;

            let p1HandleOut = p5.Vector.add(p1a, p5.Vector.fromAngle(angle1a - Math.PI / 2, radius1));
            let p1HandleIn = p5.Vector.add(p2a, p5.Vector.fromAngle(angle2a + Math.PI / 2, radius2));
            let p2HandleOut = p5.Vector.add(p2b, p5.Vector.fromAngle(angle2b - Math.PI / 2, radius2));
            let p2HandleIn = p5.Vector.add(p1b, p5.Vector.fromAngle(angle1b + Math.PI / 2, radius1));

            push();
            fill(color);
            noStroke();

            beginShape();
            vertex(p1a.x, p1a.y);
            bezierVertex(p1HandleOut.x, p1HandleOut.y, p1HandleIn.x, p1HandleIn.y, p2a.x, p2a.y);
            vertex(p2b.x, p2b.y);
            bezierVertex(p2HandleOut.x, p2HandleOut.y, p2HandleIn.x, p2HandleIn.y, p1b.x, p1b.y);
            vertex(p1b.x, p1b.y);

            endShape();
            pop();
        }
    }
}