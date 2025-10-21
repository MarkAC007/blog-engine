import { Github, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const DemoFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <div className="flex flex-col space-y-4">
              {/* Repository Attribution */}
              <div className="flex items-start gap-3">
                <Github className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Open Source:</span> Built with{' '}
                    <a
                      href="https://github.com/MarkAC007/blog-engine"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors duration-200"
                    >
                      blog-engine
                    </a>
                    , an open source AI-powered blog publishing system.
                  </p>
                </div>
              </div>

              {/* AI Attribution */}
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">AI-Assisted:</span> Content created with AI assistance and reviewed by human experts to ensure accuracy and quality. We believe in transparent, human-in-the-loop content creation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default DemoFooter;
