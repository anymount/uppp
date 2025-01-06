import React, { useState, useEffect } from 'react';
import { Upload, FileText, Save, Trash2, Sun, Moon, Search, Download, FolderPlus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
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
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [files, notes, darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('keyauth_token');
    localStorage.removeItem('username');
    navigate('/login');
  };

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
    URL.revokeObjectURL(newFiles[index].data);
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

  const username = localStorage.getItem('username');

  return (
    <div className={`min-h-screen ${darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100'}`}>
      
      {/* Header com efeito de vidro */}
      <div className={`sticky top-0 z-50 backdrop-blur-md bg-opacity-80 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } shadow-lg`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className={`text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-indigo-800'
              } flex items-center gap-3`}>
                <FolderPlus className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} size={32} />
                <span>Arquivo Notes</span>
              </h1>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Bem-vindo, {username}
              </span>
            </div>
            <div className="flex items-center gap-4">
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
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  darkMode 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
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

      {/* Resto do conteúdo permanece o mesmo */}
      {/* ... */}
    </div>
  );
}

export default Dashboard;
