export interface MetaData {
    title: string;
    description: string;
    keywords: string;
    [key: string]: string; // Allows for additional meta properties
}