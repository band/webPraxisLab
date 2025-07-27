import React, { useState } from 'react';
import MetaSearchForm from './components/MetaSearchForm';
import MetaResult from './components/MetaResult';

const App: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [metaData, setMetaData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchMetaData = async (url: string) => {
        try {
            const response = await fetch(`http://localhost:3001/meta?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch meta data');
            }
            const data = await response.json();
            setMetaData(data);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
            setMetaData(null);
        }
    };

    const handleSearch = (inputUrl: string) => {
        setUrl(inputUrl);
        fetchMetaData(inputUrl);
    };

    return (
        <div>
            <h1>Meta Search App</h1>
            <MetaSearchForm onSearch={handleSearch} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {metaData && <MetaResult metaData={metaData} />}
        </div>
    );
};

export default App;