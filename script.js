// ==========================================
// 1. SCENE SETUP
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
// Adjusted camera to center the view perfectly
camera.position.set(0, -150, 550); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ==========================================
// 2. MATERIAL CONFIGURATIONS
// ==========================================
// Visual widths are now standardized
const CLOTH_WIDTH = 250;
const CLOTH_HEIGHT = 350;

const MATERIALS = {
    DENIM: {
        name: 'Denim',
        color: 0x6688cc,
        friction: 0.90,      // Stops very fast (Heavy)
        gravity: 0.35,       // High gravity
        stiffness: 1.0,
        particlesX: 15,      // LOW RES (Large geometric folds)
        particlesY: 20,
        mouseInfluence: 0.05
    },
    LINEN: {
        name: 'Linen',
        color: 0xdddddd,
        friction: 0.96,
        gravity: 0.25,
        stiffness: 0.9,
        particlesX: 25,      // MED RES
        particlesY: 35,
        mouseInfluence: 0.1
    },
    SILK: {
        name: 'Silk',
        color: 0xff66cc,
        friction: 0.995,     // Almost no air resistance (Keeps moving)
        gravity: 0.1,        // Very light
        stiffness: 1.0,
        particlesX: 45,      // HIGH RES (Tiny silky folds)
        particlesY: 60,
        mouseInfluence: 0.2
    }
};

// ==========================================
// 3. THE CLOTH CLASS
// ==========================================
class Cloth {
    constructor(config, offsetX) {
        this.config = config;
        this.offsetX = offsetX;
        
        // Standard Three.js setup
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.LineBasicMaterial({ 
            color: config.color, 
            opacity: 0.8,
            transparent: true
        });
        this.mesh = new THREE.LineSegments(this.geometry, this.material);
        scene.add(this.mesh);

        this.init();
    }

    init() {
        this.particles = [];
        this.constraints = [];
        
        // --- NEW SIZING LOGIC ---
        // Calculate gap size so the total width is ALWAYS consistent
        const startY = -250;
        const gapX = CLOTH_WIDTH / this.config.particlesX;
        const gapY = CLOTH_HEIGHT / this.config.particlesY;

        // 1. Generate Particles
        for (let y = 0; y < this.config.particlesY; y++) {
            for (let x = 0; x < this.config.particlesX; x++) {
                const pinned = (y === 0); 
                
                this.particles.push({
                    x: this.offsetX + x * gapX, // Use dynamic gap
                    y: startY + y * gapY,
                    oldx: this.offsetX + x * gapX,
                    oldy: startY + y * gapY,
                    pinned: pinned
                });
            }
        }

        // 2. Generate Constraints (Springs)
        const getIdx = (x, y) => y * this.config.particlesX + x;

        for (let y = 0; y < this.config.particlesY; y++) {
            for (let x = 0; x < this.config.particlesX; x++) {
                const i = getIdx(x, y);
                // Right
                if (x < this.config.particlesX - 1) 
                    this.addConstraint(i, getIdx(x+1, y));
                // Bottom
                if (y < this.config.particlesY - 1) 
                    this.addConstraint(i, getIdx(x, y+1));
            }
        }
        this.updateGeometry();
    }

    addConstraint(p1Idx, p2Idx) {
        const p1 = this.particles[p1Idx];
        const p2 = this.particles[p2Idx];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        this.constraints.push({ p1: p1Idx, p2: p2Idx, length: dist, active: true });
    }

    updatePhysics() {
        // Iterations: More iterations = Stiffer fabric
        // Silk needs more iterations because high-res meshes get "stretchy" easily
        const iterations = this.config.name === 'Silk' ? 8 : 4;

        for (let k = 0; k < iterations; k++) {
            for (let i = 0; i < this.constraints.length; i++) {
                const c = this.constraints[i];
                if (!c.active) continue;

                const p1 = this.particles[c.p1];
                const p2 = this.particles[c.p2];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                const diff = (c.length - dist) / dist * this.config.stiffness;
                
                // 0.5 is standard, but we damp it slightly to prevent exploding meshes
                const correction = diff * 0.5; 

                const offsetX = dx * correction;
                const offsetY = dy * correction;

                if (!p1.pinned) { p1.x += offsetX; p1.y += offsetY; }
                if (!p2.pinned) { p2.x -= offsetX; p2.y -= offsetY; }
            }
        }

        // Verlet Integration
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (p.pinned) continue;

            const vx = (p.x - p.oldx) * this.config.friction;
            const vy = (p.y - p.oldy) * this.config.friction;

            p.oldx = p.x;
            p.oldy = p.y;

            p.x += vx;
            p.y += vy + this.config.gravity;
            
            // Floor
            if (p.y > 300) {
                 p.y = 300;
                 p.oldy = p.y + vy; 
            }
        }
    }

    updateGeometry() {
        const positions = new Float32Array(this.particles.length * 3);
        const indices = [];

        for (let i = 0; i < this.particles.length; i++) {
            positions[i*3] = this.particles[i].x;
            positions[i*3+1] = -this.particles[i].y; 
            positions[i*3+2] = 0;
        }

        for (let i = 0; i < this.constraints.length; i++) {
            const c = this.constraints[i];
            if (c.active) indices.push(c.p1, c.p2);
            else indices.push(0, 0); 
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setIndex(indices);
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.index.needsUpdate = true;
    }
}

// ==========================================
// 4. SPAWN CLOTHS
// ==========================================
// Spaced 300 units apart to match the HTML labels
const cloths = [
    new Cloth(MATERIALS.DENIM, -300), 
    new Cloth(MATERIALS.LINEN, 0),  
    new Cloth(MATERIALS.SILK, 300)   
];

// ==========================================
// 5. INTERACTION
// ==========================================
const mouse = { x: 0, y: 0, prevX: 0, prevY: 0, isDown: false, isRight: false };

window.addEventListener('mousedown', e => {
    if (e.button === 0) mouse.isDown = true;
    if (e.button === 2) mouse.isRight = true;
});
window.addEventListener('mouseup', () => { mouse.isDown = false; mouse.isRight = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('mousemove', e => {
    const vec = new THREE.Vector3(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
        0.5
    );
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(dist));

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = pos.x;
    mouse.y = -pos.y; 

    if (mouse.isDown) applyCut();
});

window.addEventListener('keydown', e => {
    if (e.code === 'Space') cloths.forEach(c => c.init());
});

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
}

function applyCut() {
    cloths.forEach(cloth => {
        for (let i = 0; i < cloth.constraints.length; i++) {
            const c = cloth.constraints[i];
            if (!c.active) continue;
            const p1 = cloth.particles[c.p1];
            const p2 = cloth.particles[c.p2];
            if (lineIntersect(mouse.prevX, mouse.prevY, mouse.x, mouse.y, p1.x, p1.y, p2.x, p2.y)) {
                c.active = false;
            }
        }
    });
}

function applyWind(cloth) {
    const range = 80; 
    for (let i = 0; i < cloth.particles.length; i++) {
        const p = cloth.particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < range) {
            const force = (range - dist) / range;
            if (!p.pinned) {
                const strength = force * cloth.config.mouseInfluence;
                p.x += dx * strength;
                p.y += dy * strength;
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    cloths.forEach(cloth => {
        cloth.updatePhysics();
        if (mouse.isRight) applyWind(cloth);
        cloth.updateGeometry();
    });
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();