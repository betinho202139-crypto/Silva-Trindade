
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Trash2,
  ExternalLink, 
  Menu, 
  X, 
  Zap, 
  User,
  LogOut,
  ChevronRight,
  Search,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  AlertCircle,
  Loader2,
  ClipboardPaste,
  Grid,
  Layers,
  Cpu,
  Download,
  Plus
} from 'lucide-react';
import { TEMPLATES } from './constants';
import { SubscriptionTier, UserProfile, PromptTemplate, PromptCategory } from './types';
import { geminiService, ImagePart } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Estado Mock Firebase/Auth ---
const MOCK_USER: UserProfile = {
  uid: 'user-123',
  email: 'pro@promptiva.ai',
  displayName: 'Alex Rivers',
  tier: SubscriptionTier.PREMIUM,
  credits: 500,
};

// --- Componentes ---

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Painel', icon: LayoutDashboard },
    { path: '/workspace', label: 'Laboratório IA', icon: MessageSquare },
    { path: '/templates', label: 'Modelos', icon: Grid },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">Promptiva</span>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  onClick={() => setIsOpen(false)} 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" 
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-brand-400" : "text-gray-500 group-hover:text-gray-300")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 pt-6 border-t border-white/10">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Categorias</p>
            <div className="space-y-1">
              {Object.values(PromptCategory).map(cat => (
                <button key={cat} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="opacity-30">#</span> {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck size={80} />
              </div>
              <p className="text-sm font-bold text-white flex items-center gap-2 relative z-10">
                <ShieldCheck size={16} /> Premium Plus
              </p>
              <p className="text-xs text-white/70 mt-1 relative z-10">Desbloqueie fotorealismo 8K e arquitetura.</p>
              <button className="mt-4 w-full py-2.5 bg-white text-brand-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors relative z-10">
                Fazer Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="lg:hidden text-white">
        <Menu size={24} />
      </button>

      <div className="hidden lg:flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 w-96">
        <Search size={16} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Buscar prompts ou categorias..." 
          className="bg-transparent border-none outline-none text-sm text-gray-300 w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold">{MOCK_USER.displayName}</span>
          <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">Plano {MOCK_USER.tier}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 bg-gradient-to-br from-indigo-900/20 to-brand-900/20 border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight">
            O Futuro dos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Prompts</span> Chegou.
          </h1>
          <p className="mt-6 text-lg text-gray-400">
            Projetado para 2026. Crie imagens hiper-realistas e identidades de marca com síntese avançada de prompts por IA.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/workspace')}
              className="px-8 py-4 bg-brand-500 hover:bg-brand-600 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all transform hover:scale-105"
            >
              Começar a Criar <ChevronRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/templates')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold transition-all"
            >
              Explorar Modelos
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 pointer-events-none">
          <Sparkles className="w-full h-full text-brand-400 animate-pulse-slow" />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Modelos Recomendados</h2>
          <Link to="/templates" className="text-brand-400 text-sm font-semibold hover:underline">Ver todos</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map(template => (
            <div key={template.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-500/50 transition-all group cursor-pointer">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{template.icon}</div>
              <h3 className="font-bold text-lg mb-1">{template.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
              {template.premiumOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-500/10 text-brand-400 text-[10px] font-bold rounded uppercase tracking-wider mb-4">
                  <Zap size={10} /> Premium
                </span>
              )}
              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => navigate(`/workspace?template=${template.id}`)}
                  className="w-full py-2 text-xs font-bold text-center bg-white/5 hover:bg-brand-500 hover:text-white rounded-lg transition-colors"
                >
                  Usar Modelo
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Workspace = () => {
  const [input, setInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [result, setResult] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Estados de Imagem Gerada
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePromptInput, setImagePromptInput] = useState('');
  const [genStudioImages, setGenStudioImages] = useState<{preview: string, mimeType: string}[]>([]);

  // Estados de Imagem
  const [imgUrl, setImgUrl] = useState('');
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgMimeType, setImgMimeType] = useState('');
  const [isFetchingImg, setIsFetchingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const genStudioFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const templateId = params.get('template');
    if (templateId) {
      const found = TEMPLATES.find(t => t.id === templateId);
      if (found) setSelectedTemplate(found);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgPreview(reader.result as string);
      setImgMimeType(file.type);
      setImgUrl(''); 
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          // Previne que o dado binário seja colado como texto no input
          e.preventDefault();
        }
      }
    }
  };

  const handleUrlBlur = async () => {
    if (imgUrl && !imgPreview) {
      setIsFetchingImg(true);
      try {
        const response = await fetch(imgUrl);
        if (!response.ok) throw new Error('Não foi possível carregar a imagem da URL');
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImgPreview(reader.result as string);
          setImgMimeType(blob.type);
          setIsFetchingImg(false);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Erro ao buscar imagem por URL:', err);
        setImgPreview(imgUrl);
        setImgMimeType('image/jpeg');
        setIsFetchingImg(false);
      }
    }
  };

  const removeImage = () => {
    setImgPreview(null);
    setImgMimeType('');
    setImgUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEnhance = async () => {
    if (!input.trim() && !selectedTemplate) return;
    setIsEnhancing(true);
    setGeneratedImage(null);
    setImagePromptInput('');
    
    let base = input;
    if (selectedTemplate) {
      base = selectedTemplate.template.replace('[TOPIC]', input || 'uma criatura majestosa');
    }

    let imagePart: ImagePart | undefined;
    if (imgPreview && imgPreview.startsWith('data:')) {
      const base64Data = imgPreview.split(',')[1];
      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imgMimeType || 'image/png'
        }
      };
    }
    
    const enhanced = await geminiService.enhancePrompt(base, selectedTemplate?.category || 'Geral', imagePart);
    setResult(enhanced);
    setIsEnhancing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearResult = () => {
    setResult('');
    setIsCopied(false);
    setGeneratedImage(null);
    setImagePromptInput('');
  };

  const extractEnglishPrompt = (text: string) => {
    const match = text.match(/\*\*English Prompt:\*\*\s*([\s\S]*)$|English Prompt:\s*([\s\S]*)$/i);
    if (match) {
      return (match[1] || match[2]).trim();
    }
    return text.trim();
  };

  const handleAutoFill = () => {
    if (result) {
      const enPrompt = extractEnglishPrompt(result);
      setImagePromptInput(enPrompt);
    }
  };

  const handleGenStudioFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGenStudioImages(prev => [...prev, { preview: reader.result as string, mimeType: file.type }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenStudioPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setGenStudioImages(prev => [...prev, { preview: reader.result as string, mimeType: file.type }]);
          };
          reader.readAsDataURL(file);
          e.preventDefault();
        }
      }
    }
  };

  const removeGenStudioImage = (index: number) => {
    setGenStudioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateImage = async () => {
    if (!imagePromptInput.trim()) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const imageParts: ImagePart[] = genStudioImages.map(img => ({
        inlineData: {
          data: img.preview.split(',')[1],
          mimeType: img.mimeType
        }
      }));

      const imageBase64 = await geminiService.generateImage(imagePromptInput, imageParts);
      if (imageBase64) {
        setGeneratedImage(imageBase64);
      } else {
        alert("Não foi possível gerar a imagem.");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const openAIStudio = () => {
    window.open('https://aistudio.google.com/app/prompts/new', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel rounded-3xl p-8 border border-white/10">
        <h2 className="text-2xl font-display font-bold mb-2">Laboratório de Prompts</h2>
        <p className="text-gray-400 mb-8">Refine suas ideias em master-prompts técnicos de alto nível.</p>

        <div className="space-y-6">
          {/* Templates */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Escolha sua Base</label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedTemplate(null)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!selectedTemplate ? 'bg-brand-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                Personalizado
              </button>
              {TEMPLATES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTemplate?.id === t.id ? 'bg-brand-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Input Principal */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">O Conceito</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedTemplate ? `Digite o tema para ${selectedTemplate.name}...` : "Descreva o que você deseja criar..."}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none shadow-inner"
            />
          </div>

          {/* Referência Visual */}
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Referência Visual & Formatos Suportados</label>
            
            {!imgPreview ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload de Arquivo */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all cursor-pointer"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="text-gray-400 group-hover:text-brand-400" size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Carregar da Galeria</span>
                  <span className="text-[10px] text-gray-600 mt-1 uppercase text-center tracking-tighter">PNG, JPG, HEIC, BMP, GIF</span>
                </div>

                {/* URL da Imagem / Colagem Direta */}
                <div className="flex flex-col gap-2">
                  <div className="relative group h-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-400">
                      {isFetchingImg ? <Loader2 size={18} className="animate-spin" /> : <ClipboardPaste size={18} />}
                    </div>
                    <textarea 
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      onBlur={handleUrlBlur}
                      onPaste={handlePaste}
                      placeholder="Cole o LINK ou a PRÓPRIA IMAGEM aqui (Ctrl+V)..."
                      className="w-full h-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-12 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none overflow-hidden"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group inline-block">
                <div className="overflow-hidden rounded-2xl border-2 border-brand-500/30 shadow-2xl shadow-brand-500/10 max-w-xs transition-all transform group-hover:scale-[1.02]">
                  <img src={imgPreview} alt="Preview" className="w-full h-auto object-cover max-h-48" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={removeImage}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Remover imagem"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" /> IA Analisando Contexto Visual ({imgMimeType.split('/')[1]?.toUpperCase() || 'REFERÊNCIA'})
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleEnhance}
            disabled={isEnhancing || isFetchingImg}
            className="w-full py-5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/20 active:scale-95"
          >
            {isEnhancing ? (
              <><Loader2 className="animate-spin" size={20} /> Sintetizando...</>
            ) : (
              <><Zap size={20} /> Gerar Prompt Avançado</>
            )}
          </button>
        </div>
      </div>

      {/* Estúdio de Geração Permanente */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <ImageIcon size={22} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white">Estúdio de Geração</h3>
              <p className="text-xs text-gray-500">Sintetize imagens a partir de prompts técnicos.</p>
            </div>
          </div>
          {result && (
            <button 
              onClick={handleAutoFill}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20"
            >
              <Zap size={14} /> Auto-preencher
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Prompt de Geração (Inglês)</label>
            <div className="relative group">
              <textarea 
                value={imagePromptInput}
                onChange={(e) => setImagePromptInput(e.target.value)}
                onPaste={handleGenStudioPaste}
                placeholder="Cole o English Prompt aqui ou descreva sua imagem..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <input 
                  type="file" 
                  ref={genStudioFileInputRef} 
                  onChange={(e) => handleGenStudioFiles(e.target.files)} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => genStudioFileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                  title="Adicionar referências visuais"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          {genStudioImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {genStudioImages.map((img, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                  <img src={img.preview} alt="Ref" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeGenStudioImage(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePromptInput.trim()}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-base flex items-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              {isGeneratingImage ? (
                <><Loader2 className="animate-spin" size={20} /> Sintetizando...</>
              ) : (
                <><ImageIcon size={20} /> Gerar Imagem</>
              )}
            </button>
          </div>

          {isGeneratingImage && (
            <div className="w-full aspect-square md:aspect-video bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="relative">
                <Loader2 className="animate-spin text-indigo-400" size={48} />
                <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
              </div>
              <p className="text-sm text-gray-400 font-mono tracking-tight">Processando modelo de difusão 2026...</p>
            </div>
          )}

          {generatedImage && !isGeneratingImage && (
            <div className="relative group rounded-3xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
              <img src={generatedImage} alt="Imagem Gerada" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-md">
                <a 
                  href={generatedImage} 
                  download="promptiva-render.png" 
                  className="px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-2xl"
                >
                  <Download size={22} /> Baixar Render
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="glass-panel rounded-3xl p-8 border-2 border-brand-500/30 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
                <Sparkles size={18} />
              </div>
              <h3 className="text-xl font-display font-bold text-brand-400">Síntese Final</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                title="Copiar prompt"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all flex items-center gap-2 text-sm border border-white/5"
              >
                {isCopied ? <span className="text-green-400">Copiado!</span> : <><Copy size={16} /> Copiar</>}
              </button>
              <button 
                onClick={clearResult}
                title="Apagar prompt"
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-all flex items-center gap-2 text-sm border border-white/5"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-2xl p-6 text-gray-300 leading-relaxed font-mono text-sm border border-white/5 italic prose prose-invert prose-sm max-w-none">
            <Markdown>{result}</Markdown>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
              <AlertCircle className="text-brand-400 shrink-0" size={20} />
              <p className="text-xs text-gray-400 leading-relaxed">
                Pronto para rodar? Esta síntese foi otimizada para modelos de 2026. Leve-a para o laboratório da Google para resultados máximos.
              </p>
            </div>
            <button 
              onClick={openAIStudio}
              className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
            >
              <ExternalLink size={20} /> Abrir no Google AI Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Templates = () => {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold">Biblioteca de Modelos</h1>
          <p className="text-gray-400">Estruturas de prompt pré-configuradas para resultados específicos.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map(template => (
            <motion.div 
              key={template.id} 
              whileHover={{ y: -4 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-brand-500/50 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl">{template.icon}</span>
              </div>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{template.icon}</div>
              <h3 className="font-bold text-xl mb-2">{template.name}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{template.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                {template.premiumOnly ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    <Zap size={12} /> Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Gratuito
                  </span>
                )}
                <button 
                  onClick={() => navigate(`/workspace?template=${template.id}`)}
                  className="px-4 py-2 text-xs font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
                >
                  Usar Modelo
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-brand-500 selection:text-white">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="transition-all duration-300 lg:pl-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/workspace" element={<PageTransition><Workspace /></PageTransition>} />
              <Route path="/templates" element={<Templates />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>

      {/* Efeitos de Fundo Flutuantes */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
    </div>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
