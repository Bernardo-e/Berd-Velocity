const programmingPassages = [
  "const calculateSpeed = (chars, time) => { const words = chars / 5; return Math.round(words / (time / 60)); };",
  "useEffect(() => { const handler = (e) => { if (e.key === 'Escape') restartTest(); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);",
  "export const fetchLocalData = async (key) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; } catch (err) { console.error(err); return null; } };",
  "import React, { createContext, useContext, useReducer } from 'react'; const AppContext = createContext(); export const useApp = () => useContext(AppContext);",
  "def binary_search(arr, target): low, high = 0, len(arr) - 1 while low <= high: mid = (low + high) // 2 if arr[mid] == target: return mid elif arr[mid] < target: low = mid + 1 else: high = mid - 1 return -1",
  "fn main() { let mut line = String::new(); println!(\"Enter text: \"); std::io::stdin().read_line(&mut line).unwrap(); let wpm = calculate_wpm(line.len(), 30.0); println!(\"Your speed: {} WPM\", wpm); }",
  "const fs = require('fs'); fs.readFile('config.json', 'utf8', (err, data) => { if (err) throw err; const config = JSON.parse(data); console.log('Loaded config: ', config); });"
];

const technologyPassages = [
  "Artificial Intelligence has rapidly transitioned from speculative research to the foundational engine of modern software systems. Large language models process massive datasets using neural architectures, enabling human-like comprehension, creative reasoning, and complex coding automation across global enterprise platforms.",
  "System design is the art of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements. Highly scalable platforms leverage distributed computing networks, load balancers, caching layers, and database sharding techniques to handle millions of simultaneous queries.",
  "Asynchronous event loops form the core of modern reactive frameworks. By delegating input and output operations to the system kernel, single-threaded runtimes can execute massive amounts of network requests concurrently without blocking main execution threads or sacrificing runtime responsiveness.",
  "Decentralized ledger technology relies on cryptographic consensus algorithms to maintain transaction records across public networks. Transactions are securely signed, broadcast, and grouped into immutable structures, guaranteeing data validation without relying on central authorities."
];

const sciencePassages = [
  "Quantum mechanics reveals that particles at the microscopic scale behave as probability waves until measured. This wave-particle duality challenges classical intuition, introducing quantum entanglement, superposition, and tunneling, which lay the physical foundation for quantum computing architectures.",
  "Deoxyribonucleic acid is the molecule that carries genetic instructions for the development, functioning, and reproduction of all known living organisms. The double helix structure comprises four nucleotide bases whose specific sequential alignment encodes the diverse blueprint of biology.",
  "Astrophysicists study the evolutionary lifecycle of stellar bodies, from collapse in nebula clouds to explosive supernovae. When massive stars exhaust their nuclear fuel, gravitational forces contract the core, resulting in black holes with escape velocities exceeding the speed of light.",
  "The chemical element carbon forms the structural foundation of organic chemistry. Its ability to create stable, covalent bonds with up to four other atoms allows carbon to synthesize complex molecular chains, rings, and biological macromolecules essential for life."
];

const historyPassages = [
  "The Industrial Revolution marked a profound turning point in human history, transitioning agrarian societies into mechanized economies. Steam engines, manufacturing innovations, and transcontinental railroads reshaped social structures, urban environments, and international commerce.",
  "Ancient Rome built an expansive empire anchored by advanced civil engineering, law, and military organization. Their vast network of roads, aqueducts, and concrete domes supported administrative cohesion, cultural assimilation, and economic trade across the Mediterranean basin for centuries.",
  "The Space Race of the mid-twentieth century catalyzed unprecedented advancements in aerospace engineering and computer science. Driven by intense geopolitical competition, the journey culminated in human footsteps on the lunar surface, inspiring generations of technological exploration.",
  "Johannes Gutenberg's development of the movable-type printing press revolutionized global communication in the fifteenth century. By making written knowledge accessible, it accelerated the spread of ideas, fueled scientific dialogue, and laid the cultural foundations of the Renaissance."
];

const quotesPassages = [
  "Simplicity is the ultimate sophistication. When you remove everything that is unnecessary, what remains is the pure essence of design and utility. Focus on the core of your task and execute it with absolute precision.",
  "Details are not the details. They make the design. Every pixel, every interaction, and every micro-animation dictates the emotional resonance of the product, transforming utility into a memorable aesthetic experience.",
  "Design is not just what it looks like and feels like. Design is how it works. A beautiful interface that fails to function seamlessly is an empty promise. True craftsmanship balances visual grace with runtime excellence.",
  "First, solve the problem. Then, write the code. Rushing into implementation without understanding the architectural constraints is a recipe for technical debt. Slow down, map the logic, and write code that endures.",
  "Precision beats speed, and timing beats force. In high-speed execution, whether typing code or compiling projects, maintaining a fluid, relaxed rhythm yields far better results than raw, unstructured effort."
];

const randomWords = [
  "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "performance", "typing",
  "focus", "speed", "accuracy", "rhythm", "design", "indigo", "teal", "space", "nebula",
  "reactor", "compiler", "asynchronous", "system", "interface", "keyboard", "switch",
  "mechanical", "linear", "tactile", "glowing", "glassmorphism", "premium", "software",
  "developer", "engineer", "terminal", "console", "render", "state", "context", "hook",
  "animation", "motion", "confetti", "grade", "score", "history", "streak", "seconds",
  "words", "countdown", "theme", "cyber", "ocean", "forest", "light", "dark", "shadow",
  "glow", "blur", "card", "hero", "particles", "smooth", "transition", "response", "delay"
];

function generateRandomText(length: number): string {
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * randomWords.length);
    result.push(randomWords[idx]);
  }
  return result.join(" ");
}

export function getParagraph(category: string, wordLimit?: number): string {
  let text = "";
  switch (category) {
    case 'programming':
      text = programmingPassages[Math.floor(Math.random() * programmingPassages.length)];
      break;
    case 'technology':
      text = technologyPassages[Math.floor(Math.random() * technologyPassages.length)];
      break;
    case 'science':
      text = sciencePassages[Math.floor(Math.random() * sciencePassages.length)];
      break;
    case 'history':
      text = historyPassages[Math.floor(Math.random() * historyPassages.length)];
      break;
    case 'quotes':
      text = quotesPassages[Math.floor(Math.random() * quotesPassages.length)];
      break;
    case 'random':
    default:
      text = generateRandomText(wordLimit || 40);
      break;
  }

  // If a word limit is set and it's not a short programming block, we limit the words
  if (wordLimit && category !== 'programming') {
    const words = text.split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ");
    } else if (words.length < wordLimit && category !== 'quotes') {
      // Pad with random words if needed
      const padding = generateRandomText(wordLimit - words.length);
      return text + " " + padding;
    }
  }

  return text;
}
