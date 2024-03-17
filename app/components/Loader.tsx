import { useState, useEffect } from 'react';

const cringeyLoadingMessages = [
    'Substituting logic for randomness...',
    'Combining unrelated concepts awkwardly...',
    'Adapting ideas to make them weirder...',
    'Modifying good ideas into bad ones...',
    'Putting useless features before requested ones...',
    'Eliminating any trace of creativity...',
    'Reversing the normal idea flow...',
    'Rearranging concepts into nonsensical order...',
    'Attempting to break the laws of physics...',
    'Scrambling your train of thought...',
    'Ideating ideas about ideating ideas...',
    'Brainstorming a brainstorm about brainstorms...',
    'Innovating new ways to un-innovate...'
];


const LoadingScreen = ({ isLoading }: { isLoading: boolean }) => {
    const [loadingMessage, setLoadingMessage] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingMessage(cringeyLoadingMessages[messageIndex]);
                setMessageIndex((messageIndex + 1) % cringeyLoadingMessages.length);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [isLoading, messageIndex]);

    return isLoading ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-10">
            <div className="loader">
            </div>
            <span className='whitespace-nowrap text-white text-sm pt-4'>{loadingMessage}</span>
        </div>
    ) : null;
};

export default LoadingScreen;