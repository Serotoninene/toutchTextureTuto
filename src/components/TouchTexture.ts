import { Texture } from "three";

interface Point {
  x: number;
  y: number;
  age: number;
  force: number;
}

interface TouchTextureOptions {
  size: number;
  maxAge: number;
  radius: number;
  debugCanvas?: boolean;
}

function outSine(n: number) {
  return Math.sin((n * Math.PI) / 2);
}

export default class TouchTexture {
  options: TouchTextureOptions;
  canDraw: boolean;

  trail: Point[];
  ctx: CanvasRenderingContext2D | null;
  texture: Texture | null;
  timeout: NodeJS.Timeout | null;

  constructor({ debugCanvas = false, size = 128, maxAge = 120, radius = 0.2 }) {
    this.options = { size, maxAge, radius, debugCanvas };
    this.trail = [];
    this.canDraw = true;

    // Initialize properties with default values
    this.ctx = null;
    this.texture = null;
    this.timeout = null;

    this.initCanvas();
  }

  initCanvas() {
    // create a 2D canvas to store the informations of the cursor
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = this.options.size;
    this.ctx = canvas.getContext("2d");
    // draw black background
    if (this.ctx) {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // use the canvas as a texture
    this.texture = new Texture(canvas);
    this.texture.needsUpdate = true;

    canvas.id = "touchTexture";
    canvas.style.position = "fixed";
    canvas.style.bottom = "0";
    canvas.style.zIndex = "10000";

    // No need to add it to the body,
    if (this.options.debugCanvas) document.body.appendChild(canvas);
  }

  update() {
    this.clear();
    if (!this.canDraw) return false;

    // age points
    this.trail.forEach((point, i) => {
      point.age++;
      // remove old
      if (point.age > this.options.maxAge) {
        this.trail.splice(i, 1);
      }
    });

    // draw white points
    this.trail.forEach((point) => {
      this.drawTouch(point);
    });

    // update texture
    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }

  clear() {
    // clear canvas
    if (this.ctx) {
      this.ctx.fillStyle = "black";
    }
    this.ctx?.fillRect(0, 0, this.options.size, this.options.size);
  }

  addTouch(point: { x: number; y: number }) {
    console.log("addTouch", point);
    let force = 0;
    const last = this.trail[this.trail.length - 1];

    // We calculate the force aka the distance between the new and old point to determine the size of the point
    if (last) {
      const dx = last.x - point.x;
      const dy = last.y - point.y;
      const dd = dx * dx + dy * dy;
      force = Math.min(dd * 10000, 1);
    }

    this.trail.push({ x: point.x, y: point.y, age: 0, force });
  }

  drawTouch(point: Point) {
    // draw point based on size and age
    const pos = {
      x: point.x * this.options.size,
      y: (1 - point.y) * this.options.size,
    };

    let intensity = 1;
    if (point.age < this.options.maxAge * 0.3) {
      intensity = outSine(point.age / (this.options.maxAge * 0.3));
    } else {
      intensity = outSine(
        1 -
          (point.age - this.options.maxAge * 0.3) / (this.options.maxAge * 0.7)
      );
    }

    intensity *= point.force;

    const radius = this.options.size * this.options.radius * intensity;
    const grd = this.ctx?.createRadialGradient(
      pos.x,
      pos.y,
      radius * 0.25,
      pos.x,
      pos.y,
      radius
    );
    // draw gradient white circles
    grd?.addColorStop(0, `rgba(255, 255, 255, 0.35)`);
    grd?.addColorStop(1, "rgba(0, 0, 0, 0.0)");

    this.ctx?.beginPath();
    if (this.ctx && grd) {
      this.ctx.fillStyle = grd;
    }
    this.ctx?.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx?.fill();
  }

  reset() {
    // reset canvas
    this.trail = [];
    this.canDraw = false;
    this.ctx?.beginPath();

    if (this.ctx) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
    }
    this.ctx?.fill();
    clearTimeout(this.timeout || 0);
    this.timeout = setTimeout(() => (this.canDraw = true), 0);
  }
}
