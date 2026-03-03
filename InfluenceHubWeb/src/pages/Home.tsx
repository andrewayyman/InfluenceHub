import Button from '../components/common/Button';

const Home = () => {
    return (
        <div className="text-center py-20">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Connect Brands with</span>{' '}
                <span className="block text-indigo-600 xl:inline">Influencers</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Manage your influencer marketing campaigns efficiently. Find the right match, track performance, and maximize ROI.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                   <Button variant="primary" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10">
                       Get Started
                   </Button>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Button variant="secondary" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10">
                        Learn More
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Home;
