import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gradientTexture from "../assets/textures/gradient.png";
import creditCardObj from "../assets/models/credit-card.obj?url";
import creditCardMtl from "../assets/models/credit-card.mtl?url";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Group, Vector3, Mesh } from 'three';

const CreditCard = ({ position }: { position: Vector3 }) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const mtlLoader = new MTLLoader();
    mtlLoader.load(creditCardMtl, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      
      objLoader.load(
        creditCardObj, 
        (group: Group) => {
          if (group instanceof Group) {
            group.scale.set(0.5, 0.5, 0.5);
            group.position.copy(position);
            groupRef.current?.add(group);

            // Handle mesh if needed
            const firstChild = group.children[0];
            if (firstChild instanceof Mesh) {
              // Mesh-specific operations here
            }
          }
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading model:', error);
        }
      );
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
    words: [
      "Payment Solutions for Every Business",
      "Seamless Processing, Maximum Security",
      "Your Trusted Payment Partner"
    ],
    loop: true,
    typeSpeed: 50,
    deleteSpeed: 25,
    delaySpeed: 2000,
  });

  useEffect(() => {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    mtlLoader.load(creditCardMtl, (materialCreator) => {
      materialCreator.preload();
      objLoader.setMaterials(materialCreator);

      objLoader.load(creditCardObj, (group: Group) => {
        const mesh = group.children[0] as Mesh;
        if (mesh) {
          // Your mesh handling code here
        }
      }, 
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error occurred loading the 3D model:', error);
      });
    });
  }, []);

  return (
    <section className="relative pt-16 min-h-[calc(100vh-5rem)] bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 3, 12], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <Scene />
        </Canvas>
      </div>
      
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight min-h-[4em] sm:min-h-[3em] md:min-h-[2.5em]">
            {text}<Cursor cursorStyle="|" />
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive payment solutions for all business types. From retail to digital services, 
            we provide reliable processing, competitive rates, and dedicated support to help your business thrive.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <div className="md:hidden">
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Call Now: +1 (305) 205-9132
              </button>
            </div>
            <div className="hidden md:block">
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Call Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mx-auto mb-6">
                <span className="text-2xl animate-float">💳</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Industry Specialists</h3>
              <p className="text-gray-600 leading-relaxed">
                Tailored solutions for every industry. Our comprehensive underwriting process ensures 
                stable, long-term partnerships with businesses of all types, backed by advanced risk 
                management and compliance tools.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mx-auto mb-6">
                <span className="text-2xl animate-float" style={{ animationDelay: '0.2s' }}>🏦</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Fast Settlement</h3>
              <p className="text-gray-600 leading-relaxed">
                Optimize your cash flow with rapid settlement options. Enjoy next-day funding, 
                automated reconciliation, and comprehensive transaction monitoring for complete 
                financial control.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mx-auto mb-6">
                <span className="text-2xl animate-float" style={{ animationDelay: '0.4s' }}>📱</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Versatile Solutions</h3>
              <p className="text-gray-600 leading-relaxed">
                Adaptable payment options for modern commerce. Access competitive rates, 
                customizable payment flows, multi-currency support, and advanced security features 
                to grow your business confidently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
