import type { ThreeElements } from '@react-three/fiber';

// React Three Fiber 9 no longer augments the global JSX namespace; opt in for <group>, <ambientLight>, …
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
