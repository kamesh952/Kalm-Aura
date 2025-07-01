import React, { useState } from 'react';
import { FiPackage, FiRotateCcw, FiShield, FiX } from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from 'react-icons/fa';
import { HiPhone } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToNewsletter, resetSubscription } from '../../redux/slices/subscribeslice';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const dispatch = useDispatch();
  const { loading, success, error, discountCode } = useSelector((state) => state.newsletter);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email.trim()) {
      dispatch(subscribeToNewsletter(email));
    }
  };

  const handleReset = () => {
    setEmail('');
    dispatch(resetSubscription());
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = 'auto';
  };

  const modalContent = {
    about: {
      title: "About Our Company",
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Our Story</h4>
          <p>Founded in 2020, CompileTab has been delivering high-quality products with a focus on sustainability and innovation.</p>
          
          <h4 className="font-bold text-lg mt-4">Our Mission</h4>
          <p>To provide exceptional products that combine functionality, style, and environmental responsibility.</p>
          
          <h4 className="font-bold text-lg mt-4">Our Team</h4>
          <p>A diverse group of passionate individuals dedicated to creating the best experience for our customers.</p>
        </div>
      )
    },
    careers: {
      title: "Career Opportunities",
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Join Our Team</h4>
          <p>We're always looking for talented individuals to join our growing team.</p>
          
          <h4 className="font-bold text-lg mt-4">Current Openings</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Frontend Developer</li>
            <li>UX Designer</li>
            <li>Customer Support Specialist</li>
            <li>Marketing Coordinator</li>
          </ul>
          
          <p className="mt-4">Send your resume to: careers@compiletab.com</p>
        </div>
      )
    },
    blog: {
      title: "Our Blog",
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Latest Articles</h4>
          <div className="space-y-6">
            <div>
              <h5 className="font-semibold">Sustainable Materials in Modern Design</h5>
              <p className="text-sm text-gray-600">Published May 15, 2024</p>
            </div>
            <div>
              <h5 className="font-semibold">The Future of E-commerce</h5>
              <p className="text-sm text-gray-600">Published April 28, 2024</p>
            </div>
            <div>
              <h5 className="font-semibold">Customer Stories: How Our Products Help</h5>
              <p className="text-sm text-gray-600">Published April 10, 2024</p>
            </div>
          </div>
          <p className="mt-4">Visit our full blog at: blog.compiletab.com</p>
        </div>
      )
    },
    press: {
      title: "Press Center",
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Press Releases</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold">CompileTab Launches New Product Line</h5>
              <p className="text-sm text-gray-600">May 1, 2024</p>
            </div>
            <div>
              <h5 className="font-semibold">Company Wins Sustainability Award</h5>
              <p className="text-sm text-gray-600">March 15, 2024</p>
            </div>
          </div>
          
          <h4 className="font-bold text-lg mt-6">Media Kit</h4>
          <p>Download our logo and brand assets:</p>
          <button className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            Download Media Kit (ZIP)
          </button>
          
          <h4 className="font-bold text-lg mt-6">Press Contact</h4>
          <p>Email: press@compiletab.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
      )
    },
    contact: {
      title: "Contact Us",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-lg">Customer Support</h4>
            <p>Email: support@compiletab.com</p>
            <p>Phone: +1 (800) 123-4567</p>
            <p className="mt-2">Mon-Fri: 9am-6pm EST</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg">Headquarters</h4>
            <p>123 Tech Street</p>
            <p>San Francisco, CA 94107</p>
            <p>United States</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg">Social Media</h4>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-blue-500 hover:text-blue-700"><FaFacebookF /></a>
              <a href="#" className="text-blue-400 hover:text-blue-600"><FaTwitter /></a>
              <a href="#" className="text-pink-500 hover:text-pink-700"><FaInstagram /></a>
            </div>
          </div>
        </div>
      )
    },
    returns: {
      title: "Returns Policy",
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Our Return Policy</h4>
          <p>We offer a 45-day return policy for most items. Some exclusions may apply.</p>
          
          <h4 className="font-bold text-lg mt-6">How to Return</h4>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Contact our support team to initiate a return</li>
            <li>Package your item with the original packaging</li>
            <li>Ship the item back to us</li>
            <li>Receive your refund once we process the return</li>
          </ol>
          
          <h4 className="font-bold text-lg mt-6">Refund Timeline</h4>
          <p>Refunds are processed within 5-7 business days after we receive your return.</p>
        </div>
      )
    },
    faqs: {
      title: "Frequently Asked Questions",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold">How long does shipping take?</h4>
            <p className="mt-1">Most orders ship within 1-2 business days. Delivery times vary by location.</p>
          </div>
          
          <div>
            <h4 className="font-bold">Do you offer international shipping?</h4>
            <p className="mt-1">Yes, we ship to most countries worldwide. Free international shipping on orders over $100.</p>
          </div>
          
          <div>
            <h4 className="font-bold">What payment methods do you accept?</h4>
            <p className="mt-1">We accept all major credit cards, PayPal, and Apple Pay.</p>
          </div>
          
          <div>
            <h4 className="font-bold">How can I track my order?</h4>
            <p className="mt-1">You'll receive a tracking number via email once your order ships.</p>
          </div>
        </div>
      )
    },
    features: {
      title: "Product Features",
      content: (
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Our Product Highlights</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Premium quality materials</li>
            <li>Sustainable manufacturing</li>
            <li>Innovative design</li>
            <li>Lifetime warranty on select items</li>
            <li>Easy-to-use interfaces</li>
          </ul>
          
          <h4 className="font-bold text-lg mt-6">Technology</h4>
          <p>Our products incorporate the latest technology to ensure performance and reliability.</p>
        </div>
      )
    }
  };

  return (
    <footer className="bg-gray-100 py-8 px-2 relative">
      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={closeModal}
          ></div>
          
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-b border-gray-200">
                <button
                  type="button"
                  className="ml-2 p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={closeModal}
                >
                  <FiX className="h-6 w-6" />
                </button>
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex-1">
                  {modalContent[activeModal]?.title}
                </h3>
              </div>
              
              {/* Modal Content */}
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto">
                {modalContent[activeModal]?.content}
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3">
        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <FiPackage className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">FREE INTERNATIONAL SHIPPING</h3>
            <p className="text-gray-600 text-sm">On all orders over $100.00</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <FiRotateCcw className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">45 DAYS RETURN</h3>
            <p className="text-gray-600 text-sm">Money back guarantee</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <FiShield className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">SECURE CHECKOUT</h3>
            <p className="text-gray-600 text-sm">100% secured checkout process</p>
          </div>
        </div>

        {/* Divider line */}
        <div className="border-t border-gray-300 mb-12"></div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-1 sm:px-2 lg:px-3">
          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg text-gray-800 mb-4 font-semibold">Newsletter</h3>
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-700 mb-2">Thank you for subscribing!</p>
                {discountCode && (
                  <p className="text-green-700 font-medium">
                    Your 10% discount code: <span className="font-bold">{discountCode}</span>
                  </p>
                )}
                <button
                  onClick={handleReset}
                  className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-500 mb-4">
                  Be the first to hear about new products, exclusive events, and online offers.
                </p>
                <p className="mb-4">Sign up and get 10% off your first order.</p>

                <form onSubmit={handleSubscribe} className="flex w-full max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="p-3 w-full text-sm border border-gray-300 rounded-l-md 
                    focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="p-3 text-sm bg-black text-white rounded-r-md hover:bg-gray-800 transition-all
                    disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </>
            )}
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg text-gray-800 mb-4 font-semibold">Company</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => openModal('about')}
                  className="hover:text-bold hover:text-black transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('careers')}
                  className="hover:text-bold hover:text-black transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('blog')}
                  className="hover:text-bold hover:text-black transition-colors"
                >
                  Blog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('press')}
                  className="hover:text-bold hover:text-black transition-colors"
                >
                  Press
                </button>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-lg text-gray-800 mb-4 font-semibold">Support</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => openModal('contact')}
                  className="hover:text-bold hover:text-black transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('returns')}
                  className="hover:text-bold hover:text-black transition-colors"
                >
                  Returns
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('faqs')}
                  className="hover:text-bold hover:text-black text-medium transition-colors"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('features')}
                  className="hover:text-bold hover:text-black transition-colors"
                >
                  Features
                </button>
              </li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className="text-lg text-gray-800 mb-4 font-semibold">Follow Us</h3>
            <div className="flex space-x-4 text-gray-600 text-xl mb-4">
              <a href="#" className="hover:text-pink-500 transition"><FaInstagram /></a>
              <a href="#" className="hover:text-blue-400 transition"><FaTwitter /></a>
              <a href="#" className="hover:text-blue-600 transition"><FaFacebookF /></a>
              <a href="#" className="hover:text-red-600 transition"><FaYoutube /></a>
            </div>

            <h3 className="text-lg text-gray-800 mb-2 font-semibold">Call Us</h3>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <HiPhone className="text-lg text-black" />
              <a href="tel:8680892898" className="text-black hover:underline">
                +91 86808 92898
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <p className="text-center text-gray-500 text-sm">
            © 2024, KalmAura. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;