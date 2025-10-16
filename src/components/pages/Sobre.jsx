import React from 'react';
import { 
  Info, 
  Code, 
  Shield, 
  Users, 
  Package, 
  TrendingUp, 
  FileText,
  Award,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const Sobre = () => {
  const funcionalidades = [
    {
      icon: Package,
      titulo: "Controle de Estoque",
      descricao: "Gestão completa de EPIs com alertas automáticos"
    },
    {
      icon: TrendingUp,
      titulo: "Movimentações",
      descricao: "Registro detalhado de entradas, saídas e ajustes"
    },
    {
      icon: FileText,
      titulo: "Relatórios",
      descricao: "Gráficos e análises para tomada de decisão"
    },
    {
      icon: Users,
      titulo: "Gestão de Usuários",
      descricao: "Controle de permissões e auditoria completa"
    },
    {
      icon: Shield,
      titulo: "Segurança",
      descricao: "Autenticação robusta com Firebase"
    }
  ];

  const tecnologias = [
    { nome: "React 18", cor: "bg-blue-100 text-blue-800" },
    { nome: "Firebase", cor: "bg-yellow-100 text-yellow-800" },
    { nome: "Tailwind CSS", cor: "bg-cyan-100 text-cyan-800" },
    { nome: "Recharts", cor: "bg-purple-100 text-purple-800" },
    { nome: "Lucide Icons", cor: "bg-pink-100 text-pink-800" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
            <Info size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sistema de Gestão de EPIs</h1>
            <p className="text-red-100 text-lg">SENAI-SP - Controle Inteligente de Equipamentos</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-6 text-red-100">
          <div className="flex items-center space-x-2">
            <Sparkles size={20} />
            <span className="font-semibold">Versão 1.0.0</span>
          </div>
          <div className="text-red-200">•</div>
          <div>Desenvolvido em 2025</div>
        </div>
      </div>

      {/* Sobre o Sistema */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Package size={24} className="text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Sobre o Sistema</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          O <strong>Sistema de Gestão de EPIs</strong> é uma solução completa desenvolvida para otimizar 
          o controle e gerenciamento de Equipamentos de Proteção Individual. Com interface moderna e 
          intuitiva, o sistema oferece controle total sobre o estoque, movimentações, vencimentos e 
          relatórios detalhados.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Desenvolvido seguindo as melhores práticas de desenvolvimento web, com foco em segurança, 
          performance e experiência do usuário, este sistema representa uma solução profissional para 
          empresas que precisam gerenciar seus EPIs de forma eficiente e organizada.
        </p>
      </div>

      {/* Funcionalidades Principais */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CheckCircle2 size={24} className="text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Funcionalidades Principais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funcionalidades.map((func, index) => (
            <div 
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <func.icon size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{func.titulo}</h3>
                  <p className="text-sm text-gray-600">{func.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tecnologias */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Code size={24} className="text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Tecnologias Utilizadas</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {tecnologias.map((tech, index) => (
            <span 
              key={index}
              className={`px-4 py-2 rounded-full font-medium ${tech.cor}`}
            >
              {tech.nome}
            </span>
          ))}
        </div>
      </div>

      {/* Desenvolvedor */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Award size={24} className="text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Desenvolvedor</h2>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-red-600 rounded-full">
              <Code size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Seu Nome Aqui
              </h3>
              <p className="text-gray-600 mb-4">
                Desenvolvedor Full Stack | Especialista em React & Firebase
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Sistema desenvolvido como projeto de gestão de EPIs, demonstrando habilidades 
                em desenvolvimento front-end, integração com Firebase, design de interfaces e 
                implementação de funcionalidades complexas.
              </p>
              
              {/* Links de Contato */}
              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://github.com/seuperfil" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Github size={18} />
                  <span>GitHub</span>
                  <ExternalLink size={14} />
                </a>
                <a 
                  href="https://linkedin.com/in/seuperfil" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Linkedin size={18} />
                  <span>LinkedIn</span>
                  <ExternalLink size={14} />
                </a>
                <a 
                  href="mailto:seuemail@email.com"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Mail size={18} />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer da Página */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">
          © 2025 Sistema de Gestão de EPIs - SENAI-SP
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Todos os direitos reservados. Desenvolvido com ❤️ e ☕
        </p>
      </div>
    </div>
  );
};

export default Sobre;
