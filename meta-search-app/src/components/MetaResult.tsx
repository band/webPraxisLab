import React from 'react';

interface MetaResultProps {
    metaData: {
        title: string;
        description: string;
        keywords: string;
	filepath: string;
    } | null;
}

const MetaResult: React.FC<MetaResultProps> = ({ metaData }) => {
    if (!metaData) {
        return <div>No meta data found.</div>;
    }

    return (
        <div>
            <h2>Meta Data Results</h2>
            <p><strong>Title:</strong> {metaData.title}</p>
            <p><strong>Description:</strong> {metaData.description}</p>
            <p><strong>Keywords:</strong> {metaData.keywords}</p>
	    <p><strong>filepath:</strong> {metaData.filepath}</p>
        </div>
    );
};

export default MetaResult;