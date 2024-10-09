import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import axios from 'axios';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const app = express();
const upload = multer({ dest: 'uploads/' });

let vectorStore;

// Custom embedding function using Ollama with llama3
async function ollamaEmbedding(text) {
  try {
    const response = await axios.post('http://localhost:11434/api/embeddings', {
      model: 'llama3',
      prompt: text
    });
    return response.data.embedding;
  } catch (error) {
    console.error('Error getting embedding from Ollama:', error);
    throw error;
  }
}

app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const loader = new PDFLoader(req.file.path);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    vectorStore = await MemoryVectorStore.fromTexts(
      splitDocs.map(doc => doc.pageContent),
      splitDocs.map(doc => doc.metadata),
      { embeddings: { embed: ollamaEmbedding } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'An error occurred while processing the PDF.' });
  }
});

app.post('/api/chat', express.json(), async (req, res) => {
  const { message } = req.body;
  
  try {
    if (!vectorStore) {
      throw new Error('No PDF has been uploaded yet.');
    }

    const relevantDocs = await vectorStore.similaritySearch(message, 3);
    const context = relevantDocs.map(doc => doc.pageContent).join('\n');

    const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3',
      prompt: `Context: ${context}\n\nHuman: ${message}\n\nAssistant:`,
      stream: false,
    });

    res.json({ message: ollamaResponse.data.response });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});