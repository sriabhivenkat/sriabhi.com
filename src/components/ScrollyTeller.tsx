// 'use client';
// import { useState, useEffect, useRef } from "react";

// export default function ScrollytellingDemo() {
//   const sections = [
//     { 
//       title: "Tokyo, Japan", 
//       content: "Explored the bustling streets of Shibuya, visited ancient temples in Asakusa, and experienced the serene beauty of cherry blossoms in spring.",
//       image: "🗼"
//     },
//     { 
//       title: "New York City, USA", 
//       content: "Wandered through Central Park, marveled at the skyline from Brooklyn Bridge, and experienced the energy of Times Square at night.",
//       image: "🗽"
//     },
//     { 
//       title: "Banff, Canada", 
//       content: "Hiked through stunning mountain trails, kayaked on turquoise Lake Louise, and spotted wildlife in the Canadian Rockies.",
//       image: "🏔️"
//     },
//     { 
//       title: "Yosemite, USA", 
//       content: "Witnessed the majesty of El Capitan, photographed Half Dome at sunset, and camped under the stars in the valley.",
//       image: "🌲"
//     },
//   ];

//   const [activeIndex, setActiveIndex] = useState(0);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!containerRef.current) return;

//       const scrollY = window.scrollY;
//       const containerTop = containerRef.current.offsetTop;
//       const viewportHeight = window.innerHeight;
      
//       // Calculate which section should be active based on scroll position
//       const relativeScroll = scrollY - containerTop + viewportHeight / 2;
//       const sectionHeight = viewportHeight;
      
//       const calculatedIndex = Math.floor(relativeScroll / sectionHeight);
//       const clampedIndex = Math.max(0, Math.min(sections.length - 1, calculatedIndex));
      
//       setActiveIndex(clampedIndex);
//     };

//     window.addEventListener('scroll', handleScroll);
//     handleScroll(); // Initial call

//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [sections.length]);

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Header */}
//       <div className="h-screen flex items-center justify-center border-b border-gray-800">
//         <div className="text-center">
//           <h1 className="text-6xl font-bold mb-4">My Travel Journey</h1>
//           <p className="text-xl text-gray-400">Scroll to explore</p>
//         </div>
//       </div>

//       {/* Scrollytelling Section */}
//       <div 
//         ref={containerRef}
//         className="relative"
//         style={{ minHeight: `${sections.length * 100}vh` }}
//       >
//         {/* Left side - Step indicators */}
//         <div className="fixed left-0 top-0 h-screen w-80 flex items-center pl-12">
//           <div className="space-y-8">
//             {sections.map((section, i) => (
//               <div
//                 key={i}
//                 ref={(el) => (sectionRefs.current[i] = el)}
//                 className={`transition-all duration-300 cursor-pointer ${
//                   activeIndex === i 
//                     ? "opacity-100 scale-100" 
//                     : "opacity-30 scale-95"
//                 }`}
//                 onClick={() => {
//                   sectionRefs.current[i]?.scrollIntoView({ 
//                     behavior: 'smooth',
//                     block: 'center'
//                   });
//                 }}
//               >
//                 <div className={`flex items-center space-x-4 ${
//                   activeIndex === i ? "text-white" : "text-gray-500"
//                 }`}>
//                   <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                     activeIndex === i ? "bg-blue-500 scale-150" : "bg-gray-600"
//                   }`} />
//                   <h3 className="text-2xl font-semibold">{section.title}</h3>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right side - Sticky content card */}
//         <div className="ml-80 min-h-screen flex items-center justify-center pr-12">
//           <div className="sticky top-1/2 -translate-y-1/2 w-full max-w-2xl">
//             <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 shadow-2xl">
//               <div className="text-8xl mb-6 text-center">
//                 {sections[activeIndex].image}
//               </div>
//               <h2 className="text-4xl font-bold mb-6 text-center">
//                 {sections[activeIndex].title}
//               </h2>
//               <p className="text-xl text-gray-300 leading-relaxed text-center">
//                 {sections[activeIndex].content}
//               </p>
              
//               {/* Progress indicator */}
//               <div className="mt-8 flex justify-center space-x-2">
//                 {sections.map((_, i) => (
//                   <div
//                     key={i}
//                     className={`h-2 rounded-full transition-all duration-300 ${
//                       i === activeIndex 
//                         ? "w-12 bg-blue-500" 
//                         : "w-2 bg-gray-700"
//                     }`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Invisible spacer sections to control scroll */}
//         <div className="absolute top-0 left-0 w-full pointer-events-none">
//           {sections.map((_, i) => (
//             <div
//               key={i}
//               className="h-screen"
//             />
//           ))}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="h-screen flex items-center justify-center border-t border-gray-800">
//         <div className="text-center">
//           <h2 className="text-4xl font-bold mb-4">More adventures to come...</h2>
//           <p className="text-xl text-gray-400">Stay tuned</p>
//         </div>
//       </div>
//     </div>
//   );
// }