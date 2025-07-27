import React, { useState } from 'react';

const MetaSearchForm: React.FC<{ onSearch: (url: string) => void }> = ({ onSearch }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            onSearch(url);
            setUrl('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter webpage URL"
                required
            />
            <button type="submit">Search</button>
        </form>
    );
};

export default MetaSearchForm;