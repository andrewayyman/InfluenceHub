import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <h2 className="text-2xl font-medium text-gray-500 mt-4">Page Not Found</h2>
            <p className="text-gray-500 mt-2">The page you are looking for doesn't exist or has been moved.</p>
            <Link to="/" className="mt-8 text-indigo-600 hover:text-indigo-500 font-medium">
                Go back home
            </Link>
        </div>
    );
};

export default NotFound;
