import { Link } from 'react-router-dom';

const DemoHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link to="/blog" className="text-2xl font-bold text-gray-900">
            AI Blog Engine
          </Link>
          <nav>
            <a 
              href="https://github.com/your-org/blog-engine" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DemoHeader;
