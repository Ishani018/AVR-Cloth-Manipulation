# Fabric Material Simulation Lab

A real-time interactive physics simulation that demonstrates the physical properties of different fabric materials through a spring-mass system. Watch how Denim, Linen, Silk, and Ultra Silk behave differently under gravity, air resistance, and user interaction.

## 🎯 Overview

This project uses Three.js and a custom physics engine to simulate four different fabric types, each with unique material properties that affect how they drape, fold, and respond to forces. The simulation demonstrates real-world fabric behavior through interactive cutting and wind effects.

## 🧵 Fabric Types

### 1. **Denim** (Heavy & Stiff)
- **Color**: Blue (`0x6688cc`)
- **Properties**:
  - High friction (0.90) - stops swinging quickly
  - High gravity (0.35) - falls fast
  - Low resolution (15×20 particles) - large geometric folds
  - Low mouse influence (0.05) - less responsive to touch
- **Behavior**: Heavy, stiff fabric that doesn't flutter much. Creates large, chunky folds.

### 2. **Linen** (Balanced)
- **Color**: Light Gray (`0xdddddd`)
- **Properties**:
  - Medium friction (0.96)
  - Medium gravity (0.25)
  - Medium resolution (25×35 particles)
  - Medium mouse influence (0.1)
- **Behavior**: Natural fiber with balanced weight and flexibility. Represents typical fabric behavior.

### 3. **Silk** (Light & Flowing)
- **Color**: Pink (`0xff66cc`)
- **Properties**:
  - Very low friction (0.995) - almost no air resistance
  - Low gravity (0.1) - very light
  - High resolution (45×60 particles) - tiny silky folds
  - High mouse influence (0.2) - very responsive
  - 8 constraint iterations - prevents stretching
- **Behavior**: Light, airy fabric that flutters continuously. Creates fine, delicate folds.

### 4. **Ultra Silk** (Ultra-Light & Ultra-Fine) ⭐ NEW
- **Color**: Deep Pink (`0xff33aa`)
- **Properties**:
  - Extremely low friction (0.998) - minimal air resistance
  - Ultra-low gravity (0.06) - barely falls
  - Ultra-high resolution (60×80 particles) - microscopic details
  - Very high mouse influence (0.3) - extremely responsive
  - Slightly less stiffness (0.95) - more flow
  - 12 constraint iterations - maintains ultra-fine mesh integrity
- **Behavior**: The most silk-like fabric. Flows like liquid, creates the finest folds, and responds dramatically to the slightest touch.

## 🎮 Controls

- **Left Click + Drag**: Cut the cloth along your mouse path
  - Breaks constraints (springs) that intersect with your cut line
  - Works on all four fabrics simultaneously
  
- **Right Click + Drag**: Apply wind/push force
  - Creates a repulsive force around your mouse
  - Pushes particles away based on distance
  - Different fabrics respond differently based on their `mouseInfluence` value

- **Spacebar**: Reset all cloths
  - Reinitializes all particles and constraints
  - Returns all fabrics to their starting positions

## 🔬 Technical Details

### Physics Engine

The simulation uses a **spring-mass system** with **Verlet integration**:

1. **Particles**: Each fabric is made of a grid of particles (masses)
2. **Constraints**: Springs connect neighboring particles, maintaining rest lengths
3. **Physics Loop**:
   - Constraint satisfaction (multiple iterations for stability)
   - Verlet integration (velocity from position differences)
   - Gravity application
   - Friction damping
   - Boundary collision (floor)

### Key Algorithms

#### Constraint Satisfaction
```javascript
// For each constraint (spring):
const diff = (restLength - currentLength) / currentLength * stiffness;
// Apply correction to both particles
```

#### Verlet Integration
```javascript
// Velocity from position difference
const vx = (x - oldX) * friction;
// Update position
x += vx + gravity;
```

#### Line-Edge Intersection (Cutting)
- Uses parametric line intersection to detect when cut path crosses constraints
- Deactivates constraints that intersect with the cut line
- Creates realistic tearing behavior

### Performance Optimizations

- **Adaptive Iterations**: Higher resolution fabrics (Silk, Ultra Silk) use more constraint iterations to prevent stretching
- **Efficient Geometry Updates**: Only updates changed positions in Three.js buffers
- **Conditional Updates**: Only processes active constraints

## 📁 Project Structure

```
instable-connection/
├── dist/
│   ├── index.html      # Main HTML file with UI
│   ├── script.js       # Core physics simulation
│   └── style.css       # Styling for UI elements
└── README.md          # This file
```

## 🚀 Running the Project

### Option 1: Simple HTTP Server
```bash
cd instable-connection/dist
python -m http.server 8080
# or
py -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Option 2: Node.js HTTP Server
```bash
cd instable-connection/dist
npx http-server -p 8080
```

### Option 3: Direct File Open
Simply open `index.html` in a modern web browser (may have CORS limitations).

## 🎨 Visual Design

- **Dark Background**: Black (`#111`) for contrast
- **Line Rendering**: Uses `LineSegments` for wireframe-style visualization
- **Color Coding**: Each fabric has a distinct color matching its material type
- **UI Overlay**: Semi-transparent controls and labels that don't interfere with interaction

## 🔧 Customization

### Adding New Fabrics

1. Add a new material to `MATERIALS` object:
```javascript
NEW_FABRIC: {
    name: 'Fabric Name',
    color: 0xrrggbb,
    friction: 0.XX,
    gravity: 0.XX,
    stiffness: 0.XX,
    particlesX: XX,
    particlesY: XX,
    mouseInfluence: 0.XX
}
```

2. Add it to the `cloths` array with appropriate spacing:
```javascript
new Cloth(MATERIALS.NEW_FABRIC, offsetX)
```

3. Add a label in `index.html`

### Adjusting Physics

- **Friction**: Higher = stops faster (0.90-0.998)
- **Gravity**: Higher = falls faster (0.06-0.35)
- **Stiffness**: Higher = less stretchy (0.95-1.0)
- **Particles**: More = finer detail but higher computational cost
- **Iterations**: More = stiffer but slower (4-12)

## 🐛 Known Limitations

- No collision detection between different cloths
- Cutting doesn't create new vertices (only breaks constraints)
- No texture mapping or advanced rendering
- Performance may degrade with very high particle counts

## 🔮 Future Enhancements

- [ ] Add texture mapping for more realistic appearance
- [ ] Implement collision detection between cloths
- [ ] Add more fabric types (cotton, wool, etc.)
- [ ] Wind effects from environment
- [ ] Save/load cloth states
- [ ] Performance metrics display
- [ ] Advanced cutting with vertex splitting

## 📚 Dependencies

- **Three.js r128**: 3D graphics library (loaded via CDN)
- No build process required - pure vanilla JavaScript

## 🎓 Educational Value

This project demonstrates:
- Spring-mass physics systems
- Verlet integration for numerical simulation
- Real-time constraint satisfaction
- Material property modeling
- Interactive 3D graphics with Three.js
- Line intersection algorithms

## 📝 License

This project is based on the original "Instable Connection" CodePen by andremichelle.

## 🙏 Credits

- Original concept: [CodePen - Instable Connection](https://codepen.io/andremichelle/pen/abvNOd)
- Three.js: https://threejs.org/

---

**Enjoy experimenting with different fabric behaviors!** Try cutting the Ultra Silk to see the most dramatic effects, or compare how Denim and Silk respond differently to wind forces.

