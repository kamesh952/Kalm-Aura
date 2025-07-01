import { Link } from "react-router-dom";
import mensCollectionImage from "../../assets/mens-collection.webp";
import womensCollectionImage from "../../assets/women.jpeg";

const GenderCollectionSection = () => {
  return (
    <section className="py-6 sm:py-8 lg:py-11 px-4 lg:px-8">
      <div className="mx-auto flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8" style={{maxWidth: '1370px'}}>
        
        {/* Women's Collection */}
        <div className="relative flex-1 group overflow-hidden rounded-lg sm:rounded-xl shadow-lg">
          <img
            src={womensCollectionImage}
            alt="Women's Collection"
            className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover transform transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 bg-white bg-opacity-90 p-3 sm:p-4 lg:p-6 rounded-md sm:rounded-lg shadow-md transform opacity-0 translate-y-4 sm:translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Women's Collection
            </h2>
            <Link
              to="collection/:collection?gender=Women"
              className="inline-block text-sm sm:text-base text-indigo-600 font-semibold transition-all duration-300 hover:text-pink-600 hover:underline hover:underline-offset-4 hover:scale-105"
            >
              Explore Now →
            </Link>
          </div>
        </div>

        {/* Men's Collection */}
        <div className="relative flex-1 group overflow-hidden rounded-lg sm:rounded-xl shadow-lg">
          <img
            src={mensCollectionImage}
            alt="Men's Collection"
            className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover transform transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 bg-white bg-opacity-90 p-3 sm:p-4 lg:p-6 rounded-md sm:rounded-lg shadow-md transform opacity-0 translate-y-4 sm:translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Men's Collection
            </h2>
            <Link
              to="collection/:collection?gender=Men"
              className="inline-block text-sm sm:text-base text-blue-600 font-semibold transition-all duration-300 hover:text-cyan-500 hover:underline hover:underline-offset-4 hover:scale-105"
            >
              Explore Now →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenderCollectionSection;