import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gradientTexture from "../assets/textures/gradient.png";
import creditCardObj from "../assets/models/credit-card.obj?url";
import creditCardMtl from "../assets/models/credit-card.mtl?url";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const CreditCard = ({ position }: { position: THREE.Vector3 }) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const mtlLoader = new MTLLoader();
    mtlLoader.load(creditCardMtl, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(creditCardObj, (object) => {
        object.scale.set(0.5, 0.5, 0.5);
        object.position.copy(position);
        groupRef.current?.add(object);
      });
    });
  }, [position]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return <group ref={groupRef} />;
};

const Scene = () => {
  const { scene } = useThree();

  useEffect(() => {
    const gradient = new THREE.TextureLoader().load(gradientTexture);
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshBasicMaterial({ 
      map: gradient,
      transparent: true,
      opacity: 0.3
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    scene.add(plane);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    return () => {
      scene.remove(plane);
      scene.remove(ambientLight);
      scene.remove(directionalLight);
    };
  }, [scene]);

  return (
    <>
      <CreditCard position={new THREE.Vector3(-4, 0, 0)} />
      <CreditCard position={new THREE.Vector3(0, 0, 0)} />
      <CreditCard position={new THREE.Vector3(4, 0, 0)} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
};

const HeroSection: React.FC = () => {
  const [text] = useTypewriter({
    words: ["Secure Payment Processing for Every Business"],
    loop: 1,
    typeSpeed: 75,
    deleteSpeed: 50,
    delaySpeed: 1000,
  });

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 3, 12], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <Scene />
        </Canvas>
      </div>
      
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Secure Payment Processing for Every Business
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Specialized solutions for high-risk and traditional merchants. Fast approvals, next-day deposits, and dedicated support to help your business grow.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Call Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mx-auto mb-6">
                <span className="text-2xl animate-float">💳</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">High-Risk Specialists</h3>
              <p className="text-gray-600 leading-relaxed">
                Expert solutions tailored for challenging industries. Our thorough upfront underwriting process ensures long-term stability for your business, with specialized risk assessment and compliance monitoring to keep you protected.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mx-auto mb-6">
                <span className="text-2xl animate-float" style={{ animationDelay: '0.2s' }}>🏦</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Next-Day Deposits</h3>
              <p className="text-gray-600 leading-relaxed">
                Keep your business cash flow healthy with rapid settlement times. Experience the convenience of next-day funding, automated reconciliation, and real-time transaction monitoring for complete financial visibility.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mx-auto mb-6">
                <span className="text-2xl animate-float" style={{ animationDelay: '0.4s' }}>📱</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Multiple Solutions</h3>
              <p className="text-gray-600 leading-relaxed">
                Flexible payment options designed for your needs. Access competitive rates, customizable payment flows, multi-currency support, and advanced fraud protection tools to streamline your payment processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
