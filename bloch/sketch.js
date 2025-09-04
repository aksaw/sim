let theta = Math.PI;  // Start in ground state (south pole)
let phi = 0;
let time = 0;
let isPlaying = false;
let rabiFreq = 2.0;  // MHz
let detuning = 0.0;  // MHz
let trail = [];
let maxTrailLength = 200;
let font;

function preload() {
    font = loadFont("./assets/times.ttf");
}

function setup() {
    let canvas = createCanvas(600, 600, WEBGL);
    canvas.parent('canvas-container');
            
    // Initialize controls
    document.getElementById('rabiSlider').addEventListener('input', function() {
        rabiFreq = parseFloat(this.value);
        document.getElementById('rabiValue').textContent = rabiFreq.toFixed(1) + ' MHz';
    });
            
    document.getElementById('detuningSlider').addEventListener('input', function() {
        detuning = parseFloat(this.value);
        document.getElementById('detuningValue').textContent = detuning.toFixed(1) + ' MHz';
    });
            
    document.getElementById('playStopBtn').addEventListener('click', function() {
        isPlaying = !isPlaying;
        this.textContent = isPlaying ? '⏸' : '▶';
    });
            
    document.getElementById('resetBtn').addEventListener('click', function() {
        theta = Math.PI;  // Ground state
        phi = 0;
        time = 0;
        trail = [];
    });
}

function draw() {
    background(0);
            
    // Minimal lighting
    ambientLight(100);
    directionalLight(180, 180, 180, -1, -1, -1);
            
    // Camera control
    orbitControl();
            
    // Draw coordinate system
    drawCoordinateSystem();
            
    // Draw Bloch sphere wireframe
    drawBlochSphere();
            
    // Update physics if playing
    if (isPlaying) {
        updateQuantumState();
    }
            
    // Draw effective magnetic field
    drawEffectiveField();
            
    // Draw state vector and trail
    drawStateVector();
    drawTrail();
            
    // Draw labels
    drawLabels();
}

function updateQuantumState() {
    let dt = 0.01;  // Time step
            
    // Effective field components (in rotating frame)
    let Bx = rabiFreq * 2 * Math.PI;  // Convert to rad/s
    let By = 0;
    let Bz = detuning * 2 * Math.PI;   // Convert to rad/s
            
    let Beff = Math.sqrt(Bx*Bx + By*By + Bz*Bz);
            
    if (Beff > 0) {
        // Rotation around effective field
        let rotAngle = Beff * dt;
                
        // Convert spherical to cartesian
        let x = Math.sin(theta) * Math.cos(phi);
        let y = Math.sin(theta) * Math.sin(phi);
        let z = Math.cos(theta);
                
        // Rotation axis (effective field direction)
        let ux = Bx / Beff;
        let uy = By / Beff;
        let uz = Bz / Beff;
                
        // Rodrigues rotation formula
        let cosAngle = Math.cos(rotAngle);
        let sinAngle = Math.sin(rotAngle);
        let dot = x*ux + y*uy + z*uz;
                
        let newX = x*cosAngle + (uy*z - uz*y)*sinAngle + ux*dot*(1-cosAngle);
        let newY = y*cosAngle + (uz*x - ux*z)*sinAngle + uy*dot*(1-cosAngle);
        let newZ = z*cosAngle + (ux*y - uy*x)*sinAngle + uz*dot*(1-cosAngle);
                
        // Convert back to spherical
        theta = Math.acos(Math.max(-1, Math.min(1, newZ)));
        phi = Math.atan2(newY, newX);
    }
            
    time += dt;
            
    // Add to trail
    let x = Math.sin(theta) * Math.cos(phi);
    let y = Math.sin(theta) * Math.sin(phi);
    let z = Math.cos(theta);
            
    trail.push({x: x, y: y, z: z});
    if (trail.length > maxTrailLength) {
        trail.shift();
    }
}

function drawCoordinateSystem() {
    stroke(80);
    strokeWeight(1);
            
    // X axis
    line(-150, 0, 0, 150, 0, 0);
    // Y axis  
    line(0, -150, 0, 0, 150, 0);
    // Z axis
    line(0, 0, -150, 0, 0, 150);
}

function drawBlochSphere() {
    push();
    stroke(60, 60, 60, 80);
    strokeWeight(1);
    noFill();
            
    // Draw minimal sphere wireframe
    for (let i = 0; i < 8; i++) {
        push();
        rotateY(i * Math.PI / 4);
        circle(0, 0, 200);
        pop();
                
        push();
        rotateX(i * Math.PI / 4);
        circle(0, 0, 200);
        pop();
    }
            
    // Equator
    stroke(100, 100, 100, 120);
    strokeWeight(1);
    circle(0, 0, 200);
            
    pop();
}

function drawEffectiveField() {
    // Draw effective magnetic field as arrow
    let Bx = rabiFreq * 2 * Math.PI;
    let By = 0;
    let Bz = detuning * 2 * Math.PI;
    let Beff = Math.sqrt(Bx*Bx + By*By + Bz*Bz);
            
    if (Beff > 0) {
        let scale = 60 / Math.max(Beff, 1);
        let fieldX = Bx * scale;
        let fieldY = By * scale;
        let fieldZ = Bz * scale;
                
        push();
        stroke(120, 120, 120);
        strokeWeight(2);
                
        // Arrow shaft
        line(0, 0, 0, fieldX, -fieldZ, fieldY);
                
        // // Arrow head - simple triangular geometry
        // push();
        // translate(fieldX, -fieldZ, fieldY);
                
        // let len = Math.sqrt(fieldX*fieldX + fieldZ*fieldZ + fieldY*fieldY);
        // if (len > 0) {
        //     let arrowSize = 8;
                    
        //     // Calculate direction angles
        //     let dirX = fieldX / len;
        //     let dirY = fieldY / len;  
        //     let dirZ = -fieldZ / len;
                    
        //     // Create simple arrow head with lines
        //     stroke(120, 120, 120);
        //     strokeWeight(2);
                    
        //     // Arrow head as simple lines pointing back along the shaft
        //     let backX = -dirX * arrowSize;
        //     let backY = -dirY * arrowSize;
        //     let backZ = -dirZ * arrowSize;
                    
        //     // Perpendicular vectors for arrow head
        //     let perpX = -dirY * arrowSize * 0.4;
        //     let perpY = dirX * arrowSize * 0.4;
        //     let perpZ = 0;
                    
        //     // Draw arrow head lines
        //     line(0, 0, 0, backX + perpX, backY + perpY, backZ + perpZ);
        //     line(0, 0, 0, backX - perpX, backY - perpY, backZ - perpZ);
        //     line(0, 0, 0, backX, backY + perpZ, backZ + perpY);
        //     line(0, 0, 0, backX, backY - perpZ, backZ - perpY);
        // }
                
        // pop();
        pop();
    }
}

function drawStateVector() {
    // Current state position
    let x = Math.sin(theta) * Math.cos(phi);
    let y = Math.sin(theta) * Math.sin(phi);
    let z = Math.cos(theta);
            
    // Scale for visualization
    let scale = 100;
            
    push();
    translate(x * scale, -z * scale, y * scale);
            
    // State sphere - smaller and white
    fill(255, 255, 255);
    noStroke();
    sphere(4);
            
    // Vector from origin - thin gray line
    stroke(255, 255, 255);
    strokeWeight(2);
    line(-x * scale, z * scale, -y * scale, 0, 0, 0);
            
    pop();
}

function drawTrail() {
    if (trail.length < 2) return;
            
    stroke(200, 200, 200, 150);
    strokeWeight(1);
    noFill();
            
    beginShape();
    for (let i = 0; i < trail.length; i++) {
        let point = trail[i];
        let scale = 100;
        vertex(point.x * scale, -point.z * scale, point.y * scale);
    }
    endShape();
}

function drawLabels() {
    push();
            
    // Disable 3D transformations for text
    // camera(0, 0, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
            
    // State annotations on the sphere
    fill(255, 255, 255);
    textFont(font);
    textAlign(CENTER, CENTER);
    textSize(20);
    // textFont('monospace');
            
    // Ground state at south pole
    text("|g>", 0, 135);
            
    // Excited state at north pole  
    text("|e>", 0, -135);
            
    // // Population display - minimal
    // let excitedProb = (1 - Math.cos(theta)) / 2;
    // let groundProb = (1 + Math.cos(theta)) / 2;
            
    // textAlign(LEFT, TOP);
    // textSize(10);
    // fill(255, 255, 255);
    // // textFont('monospace');
    // text("P₁ " + excitedProb.toFixed(3), -150, -150);
    // text("P₀ " + groundProb.toFixed(3), -150, -165);
            
    pop();
}