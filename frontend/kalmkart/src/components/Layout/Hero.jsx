import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import hero1 from "../../assets/rabbit-hero.webp";
import hero2 from "../../assets/hero2.jpg";
import hero3 from "../../assets/hero3.jpg";
import hero4 from "../../assets/herro4.jpg";

const slides = [
  {
    image: hero1,
    title: "Vacation Ready",
    subtitle: "Explore our vacation-ready outfits with fast worldwide shipping.",
  },
  {
    image: hero2,
    title: "Summer Collection",
    subtitle: "Step into sunshine with our exclusive summer looks.",
  },
  {
    image: hero3,
    title: "Urban Explorer",
    subtitle: "Style meets comfort for your everyday adventures.",
  },
  {
    image: hero4,
    title: "Beach Vibes",
    subtitle: "Chill in breezy beachwear made for paradise.",
  },
];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden">
   {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <h1 className="text-4xl md:text-7xl lg:text-9xl font-bold tracking-tighter uppercase mb-4">
                {slide.title}
              </h1>
              <p className="text-sm md:text-lg tracking-tight mb-6 max-w-xl mx-auto">
                {slide.subtitle}
              </p>
              <Link
                to="collection/:collection"
                className="bg-white text-gray-950 px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Hero;
