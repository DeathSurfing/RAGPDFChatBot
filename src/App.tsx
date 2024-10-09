import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Chat } from './components/Chat';
import { MessageCircle } from 'lucide-react';

function App() {
  const [pdfUploaded, setPdfUploaded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <MessageCircle className="mr-2" />
        AI Chatbot with PDF RAG
      </h1>
      {!pdfUploaded ? (
        <FileUpload onUploadSuccess={() => setPdfUploaded(true)} />
      ) : (
        <Chat />
      )}
    </div>
  );
}

export default App;