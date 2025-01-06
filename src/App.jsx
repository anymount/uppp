import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Upload, FileText, Save, Trash2, Sun, Moon, Search, Download, FolderPlus } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('files');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentNote, setCurrentNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Persistência de dados
  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [files, notes, darkMode]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        const newFile = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          category: 'Geral',
          data: URL.createObjectURL(file)
        };
        setFiles([...files, newFile]);
      } else {
        alert('Por favor, envie apenas arquivos .zip');
      }
    }
  };

  const handleAddNote = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now(),
        text: currentNote,
        category: selectedCategory,
        createdAt: new Date().toISOString(),
        formatted: false
      };
      setNotes([...notes, newNote]);
      setCurrentNote('');
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].data); // Limpa o URL do objeto
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const isAuthenticated = () => {
    return localStorage.getItem('keyauth_token') !== null;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={isAuthenticated() ? (
            <div className={`min-h-screen ${darkMode 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100'}`}>
              
              {/* Header com efeito de vidro */}
              <div className={`sticky top-0 z-50 backdrop-blur-md bg-opacity-80 ${
                darkMode ? 'bg-gray-900' : 'bg-white'
              } shadow-lg`}>
                <div className="container mx-auto px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h1 className={`text-4xl font-bold ${
                      darkMode ? 'text-white' : 'text-indigo-800'
                    } flex items-center gap-3`}>
                      <FolderPlus className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} size={32} />
                      <span>Arquivo Notes</span>
                    </h1>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`p-3 rounded-full transition-all duration-300 ${
                        darkMode 
                          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                          : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                      }`}
                    >
                      {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                  </div>

                  {/* Barra de Pesquisa */}
                  <div className="mt-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Pesquisar arquivos e anotações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-full transition-all duration-300 ${
                          darkMode 
                            ? 'bg-gray-800 text-white border-gray-700 focus:bg-gray-700' 
                            : 'bg-white text-gray-800 border-gray-200'
                        } border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Seção de Arquivos */}
                  <div className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-800 hover:shadow-indigo-500/10' 
                      : 'bg-white hover:shadow-2xl'
                  }`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          Arquivos ZIP
                        </h2>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".zip"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                            darkMode 
                              ? 'bg-indigo-600 hover:bg-indigo-700' 
                              : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white transform hover:scale-105`}>
                            <Upload size={20} />
                            <span>Upload</span>
                          </div>
                        </label>
                      </div>

                      <div className="space-y-4">
                        {filteredFiles.map((file, index) => (
                          <div key={file.id} className={`group rounded-xl p-4 transition-all duration-300 ${
                            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${
                                  darkMode ? 'bg-gray-600' : 'bg-white'
                                } shadow-md`}>
                                  <FileText className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                                </div>
                                <div>
                                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {file.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => downloadFile(file)}
                                  className={`p-2 rounded-lg transition-all duration-300 ${
                                    darkMode 
                                      ? 'bg-gray-600 hover:bg-gray-500' 
                                      : 'bg-white hover:bg-gray-200'
                                  }`}
                                >
                                  <Download size={20} className="text-blue-500" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(index)}
                                  className={`p-2 rounded-lg transition-all duration-300 ${
                                    darkMode 
                                      ? 'bg-gray-600 hover:bg-gray-500' 
                                      : 'bg-white hover:bg-gray-200'
                                  }`}
                                >
                                  <Trash2 size={20} className="text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Seção de Anotações */}
                  <div className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-800 hover:shadow-indigo-500/10' 
                      : 'bg-white hover:shadow-2xl'
                  }`}>
                    <div className="p-6">
                      <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Anotações
                      </h2>
                      <div className="mb-6">
                        <textarea
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          className={`w-full p-4 rounded-xl transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-700 text-white border-gray-600 focus:bg-gray-600' 
                              : 'bg-gray-50 border-gray-200 focus:bg-white'
                          } border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          placeholder="Digite sua anotação aqui..."
                          rows="4"
                        />
                        <div className="flex gap-3 mt-4">
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${
                              darkMode 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 border-gray-200'
                            } border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          >
                            <option>Geral</option>
                            <option>Trabalho</option>
                            <option>Pessoal</option>
                            <option>Importante</option>
                          </select>
                          <button
                            onClick={handleAddNote}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${
                              darkMode 
                                ? 'bg-indigo-600 hover:bg-indigo-700' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white transform hover:scale-105`}
                          >
                            <Save size={20} />
                            <span>Salvar</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {filteredNotes.map((note) => (
                          <div key={note.id} className={`rounded-xl p-5 transition-all duration-300 ${
                            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className={`px-4 py-1 rounded-full text-sm ${
                                    darkMode 
                                      ? 'bg-gray-600 text-white' 
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {note.category}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {formatDate(note.createdAt)}
                                  </span>
                                </div>
                                <p className={`${darkMode ? 'text-white' : 'text-gray-700'} leading-relaxed`}>
                                  {note.text}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className={`p-2 rounded-lg transition-all duration-300 ml-4 ${
                                  darkMode 
                                    ? 'bg-gray-600 hover:bg-gray-500' 
                                    : 'bg-white hover:bg-gray-200'
                                }`}
                              >
                                <Trash2 size={20} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
