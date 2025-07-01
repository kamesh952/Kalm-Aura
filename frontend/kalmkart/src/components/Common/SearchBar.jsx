import { useState, useEffect, useRef } from "react";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null); // 🔁 For outside click detection

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
    setSearchTerm("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
    console.log("Search Term:", searchTerm);
    setSearchTerm("");
    setIsOpen(false);
  };

  // 🧠 Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSuggestions([]);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 🔁 Debounced Search Suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 1) {
        setSuggestions(
          ["apple", "banana", "cherry", "grape", "orange"].filter((item) =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div
      ref={searchRef}
      className={`flex items-center justify-center w-full transition-all duration-500 ${
        isOpen ? "absolute top-0 left-0 bg-white w-full h-32 z-50" : "w-auto"
      }`}
    >
      {isOpen ? (
        <form
          onSubmit={handleSearch}
          className="relative flex flex-col items-center justify-start w-full pt-2"
        >
          <div className="relative w-2/3">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-100 px-4 py-2 pr-12 rounded-lg focus:outline-none w-full placeholder:text-gray-700 "
            />

            {/* Search Icon */}
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              <HiMagnifyingGlass className="h-6 w-6" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleSearchToggle}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black p-1.5 rounded-full transition duration-300"
            >
              <HiMiniXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <ul className="mt-2 bg-white shadow rounded w-2/3 max-h-40 overflow-y-auto text-left text-gray-700 text-sm border">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSearchTerm(item);
                    if (onSearch) onSearch(item);
                    setSuggestions([]);
                    setIsOpen(false);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </form>
      ) : (
        <button onClick={handleSearchToggle}>
          <HiMagnifyingGlass className="h-6 w-6 text-gray-600 hover:text-black" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
