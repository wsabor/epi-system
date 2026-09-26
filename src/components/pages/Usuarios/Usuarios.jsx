import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Eye,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Ban,
  History,
} from "lucide-react";
import FormularioUsuario from "./FormularioUsuario";
import ModalConfirmacao from "./ModalConfirmacao";
import LogAuditoria from "./LogAuditoria";
import ConviteUsuarioModal from "../../modals/ConviteUsuarioModal";

import { useUsuarios } from "../../../hooks/useUsuarios";
import { useConvites } from "../../../hooks/useConvites";
import { useAuth } from "../../../contexts/AuthContext";

const STATUS_CONVITE = {
  pendente: { texto: "Pendente", classe: "bg-yellow-100 text-yellow-800" },
  usado: { texto: "Aceito", classe: "bg-green-100 text-green-800" },
  expirado: { texto: "Expirado", classe: "bg-gray-100 text-gray-700" },
  revogado: { texto: "Revogado", classe: "bg-red-100 text-red-800" },
};

// Usuários entram só por convite e nunca são excluídos (só desativados): o histórico fica preservado.
// A auditoria é gravada pela API; esta tela apenas consulta.
const Usuarios = () => {
  const { usuarios, loading: loadingUsuarios, updateUsuario, setAtivoUsuario } = useUsuarios();
  const { convites, criarConvite, revogarConvite } = useConvites();
  const { usuario: usuarioLogado } = useAuth();

  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarConvite, setMostrarConvite] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modalConfirmacao, setModalConfirmacao] = useState({
    aberto: false,
    titulo: "",
    mensagem: "",
    onConfirmar: null,
  });
  const [visualizarAuditoria, setVisualizarAuditoria] = useState(false);
  const [usuarioAuditoria, setUsuarioAuditoria] = useState(null);

  // Configurações de permissões
  const roles = {
    admin: {
      nome: "Administrador",
      cor: "red",
      icon: Shield,
      permissoes: [
        "Convidar, editar e desativar usuários",
        "Cadastrar e editar EPIs",
        "Ativar e desativar EPIs",
        "Registrar movimentações",
        "Gerar e exportar relatórios",
        "Visualizar auditoria",
      ],
    },
    operador: {
      nome: "Operador",
      cor: "blue",
      icon: Users,
      permissoes: [
        "Cadastrar e editar EPIs",
        "Registrar movimentações",
        "Gerar e exportar relatórios",
        "Visualizar estoque",
      ],
    },
    visualizador: {
      nome: "Visualizador",
      cor: "gray",
      icon: Eye,
      permissoes: ["Visualizar estoque e movimentações"],
    },
  };

  // Filtrar usuários
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchBusca =
        usuario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.departamento?.toLowerCase().includes(busca.toLowerCase());

      const matchRole = filtroRole === "todos" || usuario.role === filtroRole;
      const matchStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativo" && usuario.ativo) ||
        (filtroStatus === "inativo" && !usuario.ativo);

      return matchBusca && matchRole && matchStatus;
    });
  }, [usuarios, busca, filtroRole, filtroStatus]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    return {
      total: usuarios.length,
      ativos: usuarios.filter((u) => u.ativo).length,
      inativos: usuarios.filter((u) => !u.ativo).length,
      admins: usuarios.filter((u) => u.role === "admin").length,
      operadores: usuarios.filter((u) => u.role === "operador").length,
      visualizadores: usuarios.filter((u) => u.role === "visualizador").length,
    };
  }, [usuarios]);

  // Handlers
  const handleNovoUsuario = () => {
    setMostrarConvite(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setMostrarFormulario(true);
  };

  const handleSalvarUsuario = async ({ nome, departamento, telefone, role }) => {
    try {
      await updateUsuario(usuarioEditando.id, { nome, departamento, telefone, role });
      setMostrarFormulario(false);
      setUsuarioEditando(null);
    } catch (error) {
      alert("Erro ao salvar usuário: " + error.message);
    }
  };

  const fecharConfirmacao = () => setModalConfirmacao((m) => ({ ...m, aberto: false }));

  const handleToggleStatus = (usuario) => {
    setModalConfirmacao({
      aberto: true,
      titulo: usuario.ativo ? "Desativar Usuário" : "Reativar Usuário",
      mensagem: usuario.ativo
        ? `Desativar ${usuario.nome}? O acesso é bloqueado na hora e o histórico é mantido.`
        : `Reativar ${usuario.nome}? Ele(a) poderá entrar novamente com a senha que já tinha.`,
      tipo: usuario.ativo ? "warning" : "info",
      onConfirmar: async () => {
        try {
          await setAtivoUsuario(usuario.id, !usuario.ativo);
          fecharConfirmacao();
        } catch (error) {
          alert("Erro ao alterar status: " + error.message);
        }
      },
    });
  };

  const handleRevogarConvite = (convite) => {
    setModalConfirmacao({
      aberto: true,
      titulo: "Revogar Convite",
      mensagem: `Revogar o convite de ${convite.email}? O link enviado deixa de funcionar.`,
      tipo: "warning",
      onConfirmar: async () => {
        try {
          await revogarConvite(convite.id);
          fecharConfirmacao();
        } catch (error) {
          alert("Erro ao revogar convite: " + error.message);
        }
      },
    });
  };

  // usuario = null abre a auditoria geral (todas as ações do sistema)
  const handleVisualizarAuditoria = (usuario) => {
    setUsuarioAuditoria(usuario);
    setVisualizarAuditoria(true);
  };

  const formatarData = (data) => (data ? new Date(data).toLocaleString("pt-BR") : "Nunca");

  // Loading state
  if (loadingUsuarios) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (visualizarAuditoria) {
    return (
      <LogAuditoria usuario={usuarioAuditoria} onVoltar={() => setVisualizarAuditoria(false)} />
    );
  }

  if (mostrarFormulario) {
    return (
      <FormularioUsuario
        usuario={usuarioEditando}
        roles={roles}
        ehVoceMesmo={usuarioEditando?.id === usuarioLogado?.id}
        onSalvar={handleSalvarUsuario}
        onCancelar={() => {
          setMostrarFormulario(false);
          setUsuarioEditando(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal de Convite */}
      <ConviteUsuarioModal
        isOpen={mostrarConvite}
        onClose={() => setMostrarConvite(false)}
        criarConvite={criarConvite}
      />

      {/* Modal de Confirmação */}
      <ModalConfirmacao
        aberto={modalConfirmacao.aberto}
        titulo={modalConfirmacao.titulo}
        mensagem={modalConfirmacao.mensagem}
        tipo={modalConfirmacao.tipo}
        onConfirmar={modalConfirmacao.onConfirmar}
        onCancelar={() =>
          setModalConfirmacao({ ...modalConfirmacao, aberto: false })
        }
      />

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h2>
          <p className="text-gray-600">
            Controle de acesso e permissões do sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleVisualizarAuditoria(null)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History size={20} />
            <span>Auditoria geral</span>
          </button>
          <button
            onClick={handleNovoUsuario}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <UserPlus size={20} />
            <span>Convidar Usuário</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas.total}
              </p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ativos</p>
              <p className="text-2xl font-bold text-green-700">
                {estatisticas.ativos}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-700">
                {estatisticas.inativos}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Admins</p>
              <p className="text-2xl font-bold text-red-700">
                {estatisticas.admins}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Operadores</p>
              <p className="text-2xl font-bold text-blue-700">
                {estatisticas.operadores}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Visualizadores
              </p>
              <p className="text-2xl font-bold text-gray-700">
                {estatisticas.visualizadores}
              </p>
            </div>
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nome, email ou departamento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroRole}
              onChange={(e) => setFiltroRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="todos">Todas as Funções</option>
              <option value="admin">Administrador</option>
              <option value="operador">Operador</option>
              <option value="visualizador">Visualizador</option>
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => {
                const roleConfig = roles[usuario.role] || roles.visualizador;
                const RoleIcon = roleConfig?.icon || Eye;

                return (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-700 font-semibold">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {usuario.nome}
                          </p>
                          <p className="text-sm text-gray-500">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <RoleIcon size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {roleConfig.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {usuario.departamento}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{formatarData(usuario.ultimoAcesso)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {usuario.ativo ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="mr-1" />
                            Inativo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleVisualizarAuditoria(usuario)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Auditoria"
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          onClick={() => handleEditarUsuario(usuario)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        {usuario.id !== usuarioLogado?.id && (
                          <button
                            onClick={() => handleToggleStatus(usuario)}
                            className={`p-2 rounded-lg transition-colors ${
                              usuario.ativo
                                ? "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                                : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                            }`}
                            title={usuario.ativo ? "Desativar" : "Reativar"}
                          >
                            {usuario.ativo ? (
                              <ToggleRight size={18} />
                            ) : (
                              <ToggleLeft size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensagem quando não há resultados */}
      {usuariosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou convide um novo usuário
          </p>
        </div>
      )}

      {/* Convites */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center space-x-2">
          <Mail size={18} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Convites</h3>
        </div>
        {convites.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">Nenhum convite enviado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Convidado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {convites.map((convite) => {
                  const status = STATUS_CONVITE[convite.status];
                  return (
                    <tr key={convite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{convite.nome}</p>
                        <p className="text-sm text-gray-500">{convite.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{roles[convite.role]?.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(convite.criadoEm).toLocaleDateString("pt-BR")}
                        <span className="block text-xs text-gray-400">por {convite.criadoPorNome}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(convite.expiraEm).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${status.classe}`}>
                          {status.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {convite.status === "pendente" && (
                          <button
                            onClick={() => handleRevogarConvite(convite)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Revogar convite"
                          >
                            <Ban size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
