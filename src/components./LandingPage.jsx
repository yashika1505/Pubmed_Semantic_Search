import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaSearch, FaClock, FaArrowRight, FaMicroscope, FaBookOpen, FaChartLine } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaMicroscope className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">PubMed Semantic</span>
          </div>
          <Link 
            to="/search" 
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Semantic
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> PubMed</span>
              <br />Research
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-4xl mx-auto">
            Explore PubMed research papers with AI-powered semantic search. Our system understands both keywords and MeSH terms to deliver the most relevant articles for your query.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/search"
                className="btn-primary text-lg px-8 py-4 rounded-xl flex items-center space-x-2 group"
              >
                <span>Start Research</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 rounded-xl">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Semantic Search?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced AI technology understands context and meaning, not just keywords
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card card-hover p-8 text-center group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaBrain className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Matching</h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced AI algorithms understand synonyms, related concepts, and contextual relationships to find the most relevant papers.
            </p>
          </div>
          
          <div className="card card-hover p-8 text-center group">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaSearch className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Precision Results</h3>
            <p className="text-gray-600 leading-relaxed">
              Get highly accurate and comprehensive search results that match your research intent, not just your keywords.
            </p>
          </div>
          
          <div className="card card-hover p-8 text-center group">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaClock className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Time</h3>
            <p className="text-gray-600 leading-relaxed">
              Reduce hours of manual searching through irrelevant papers. Find exactly what you need, faster.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-fadeInUp">
              <div className="text-4xl font-bold mb-2">30M+</div>
              <div className="text-blue-100">Research Papers</div>
            </div>
            <div className="animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div className="animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold mb-2">10x</div>
              <div className="text-blue-100">Faster Search</div>
            </div>
            <div className="animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slideIn">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Advanced Semantic Technology</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Our platform leverages cutting-edge natural language processing and machine learning 
              to understand the semantic meaning of your research queries, not just the keywords.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">MeSH term understanding and expansion</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Contextual relationship mapping</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Advanced filtering and sorting options</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Real-time relevance scoring</span>
              </div>
            </div>
          </div>
          
          <div className="animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FaBookOpen className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Research Made Simple</h3>
                  <p className="text-gray-600">Find relevant papers in seconds</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Search Accuracy</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">95%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Time Saved</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">90%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">User Satisfaction</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '98%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">98%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Research?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of researchers who have already discovered the power of semantic search.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center space-x-2 bg-white text-gray-900 font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-lg"
          >
            <span>Start Your Search</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
