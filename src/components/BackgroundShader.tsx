import React, { useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

// Hex to RGB normalized vector helper
function hexToRgbVec(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

// Color schemes matching the CSS variables for fluid canvas coloring
const SCHEMES = {
  dark: {
    color1: '#060e20',
    color2: '#6366f1', // Primary Indigo
    color3: '#131b2e',
  },
  light: {
    color1: '#f1f5f9',
    color2: '#4f46e5', // Light Indigo
    color3: '#e2e8f0',
  },
  cyber: {
    color1: '#08030f',
    color2: '#ff007f', // Cyber Neon Pink
    color3: '#1c0b30',
  },
  ocean: {
    color1: '#01060e',
    color2: '#0284c7', // Ocean Blue
    color3: '#041d3c',
  },
  forest: {
    color1: '#030603',
    color2: '#15803d', // Forest Green
    color3: '#0d1e13',
  },
};

export const BackgroundShader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { settings } = useApp();
  const theme = settings.theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) {
      console.warn('WebGL not supported, falling back to static gradient');
      return;
    }

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse / u_resolution;
        
        float time = u_time * 0.15;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;
        
        float noise = 0.0;
        vec2 pos = p * 0.75;
        
        for(float i = 1.0; i < 4.0; i++){
          pos.x += 0.25 * sin(i * pos.y + time + mouse.x);
          pos.y += 0.25 * cos(i * pos.x + time + mouse.y);
          noise += abs(cos(pos.x + pos.y) / i);
        }
        
        vec3 finalColor = mix(u_color1, u_color3, noise * 0.5);
        finalColor = mix(finalColor, u_color2, pow(noise * 0.4, 3.0) * 0.35);
        
        // Subtle aura around cursor
        float dist = length(uv - mouse);
        finalColor += u_color2 * (1.0 - smoothstep(0.0, 0.7, dist)) * 0.08;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const color1Loc = gl.getUniformLocation(program, 'u_color1');
    const color2Loc = gl.getUniformLocation(program, 'u_color2');
    const color3Loc = gl.getUniformLocation(program, 'u_color3');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    });
    resizeObserver.observe(canvas);

    // Initial size sync
    canvas.width = canvas.clientWidth || 1280;
    canvas.height = canvas.clientHeight || 720;

    const render = (t: number) => {
      if (!canvas || !gl) return;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Fetch colors for current theme
      const scheme = SCHEMES[theme] || SCHEMES.dark;
      const rgb1 = hexToRgbVec(scheme.color1);
      const rgb2 = hexToRgbVec(scheme.color2);
      const rgb3 = hexToRgbVec(scheme.color3);

      gl.uniform1f(timeLoc, t * 0.001);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouse.x, mouse.y);
      gl.uniform3f(color1Loc, rgb1[0], rgb1[1], rgb1[2]);
      gl.uniform3f(color2Loc, rgb2[0], rgb2[1], rgb2[2]);
      gl.uniform3f(color3Loc, rgb3[0], rgb3[1], rgb3[2]);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Adjust transparency based on animation quality or settings
  const opacityClass = settings.animationLevel === 'none' ? 'opacity-0' : settings.animationLevel === 'low' ? 'opacity-10' : 'opacity-30';

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-700 ${opacityClass}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
