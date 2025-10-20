import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Eye,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import FormularioUsuario from "./FormularioUsuario";
import ModalConfirmacao from "./ModalConfirmacao";
import LogAuditoria from "./LogAuditoria";
import ConviteUsuarioModal from "../../modals/ConviteUsuarioModal";

import { useUsuarios } from "../../../hooks/useUsuarios";
import { useLogs } from "../../../hooks/useLogs";
import { useAuth } from "../../../contexts/AuthContext";

const Usuarios = () => {
  // Hooks do Firebase
  const {
    usuarios,
    loading: loadingUsuarios,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioStatus,
  } = useUsuarios();

  const { logs, addLog } = useLogs();
  const { currentUser } = useAuth();

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
        "Acesso total ao sistema",
        "Gerenciar usuários",
        "Configurar sistema",
        "Criar/Editar/Excluir EPIs",
        "Registrar movimentações",
        "Gerar relatórios",
        "Visualizar auditoria",
      ],
    },
    operador: {
      nome: "Operador",
      cor: "blue",
      icon: Users,
      permissoes: [
        "Criar/Editar EPIs",
        "Registrar movimentações",
        "Gerar relatórios",
        "Visualizar estoque",
      ],
    },
    visualizador: {
      nome: "Visualizador",
      cor: "gray",
      icon: Eye,
      permissoes: ["Visualizar estoque", "Gerar relatórios básicos"],
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

  const handleSalvarUsuario = async (dadosUsuario) => {
    try {
      if (usuarioEditando) {
        // Editar
        await updateUsuario(usuarioEditando.id, dadosUsuario);
        await registrarLog({
          usuarioId: currentUser?.uid || "admin",
          usuarioNome: currentUser?.displayName || "Admin Sistema",
          acao: "EDITAR_USUARIO",
          descricao: `Editou o usuário: ${dadosUsuario.nome}`,
        });
      } else {
        // Criar
        await addUsuario(dadosUsuario);
        await registrarLog({
          usuarioId: currentUser?.uid || "admin",
          usuarioNome: currentUser?.displayName || "Admin Sistema",
          acao: "CRIAR_USUARIO",
          descricao: `Criou o usuário: ${dadosUsuario.nome}`,
        });
      }
      setMostrarFormulario(false);
      setUsuarioEditando(null);
    } catch (error) {
      alert("Erro ao salvar usuário: " + error.message);
    }
  };

  const handleToggleStatus = (usuario) => {
    setModalConfirmacao({
      aberto: true,
      titulo: usuario.ativo ? "Desativar Usuário" : "Ativar Usuário",
      mensagem: `Tem certeza que deseja ${
        usuario.ativo ? "desativar" : "ativar"
      } o usuário ${usuario.nome}?`,
      tipo: usuario.ativo ? "warning" : "info",
      onConfirmar: async () => {
        try {
          await toggleUsuarioStatus(usuario.id, !usuario.ativo);
          await registrarLog({
            usuarioId: currentUser?.uid || "admin",
            usuarioNome: currentUser?.displayName || "Admin Sistema",
            acao: usuario.ativo ? "DESATIVAR_USUARIO" : "ATIVAR_USUARIO",
            descricao: `${usuario.ativo ? "Desativou" : "Ativou"} o usuário: ${
              usuario.nome
            }`,
          });
          setModalConfirmacao({ ...modalConfirmacao, aberto: false });
        } catch (error) {
          alert("Erro ao alterar status: " + error.message);
        }
      },
    });
  };

  const handleExcluirUsuario = (usuario) => {
    setModalConfirmacao({
      aberto: true,
      titulo: "Excluir Usuário",
      mensagem: `Tem certeza que deseja excluir permanentemente o usuário ${usuario.nome}? Esta ação não pode ser desfeita.`,
      tipo: "danger",
      onConfirmar: async () => {
        try {
          await deleteUsuario(usuario.id);
          await registrarLog({
            usuarioId: currentUser?.uid || "admin",
            usuarioNome: currentUser?.displayName || "Admin Sistema",
            acao: "EXCLUIR_USUARIO",
            descricao: `Excluiu o usuário: ${usuario.nome}`,
          });
          setModalConfirmacao({ ...modalConfirmacao, aberto: false });
        } catch (error) {
          alert("Erro ao excluir usuário: " + error.message);
        }
      },
    });
  };

  const handleVisualizarAuditoria = (usuario) => {
    setUsuarioAuditoria(usuario);
    setVisualizarAuditoria(true);
  };

  const registrarLog = async ({ usuarioId, usuarioNome, acao, descricao }) => {
    try {
      await addLog({
        usuarioId,
        usuarioNome,
        acao,
        descricao,
      });
    } catch (error) {
      console.error("Erro ao registrar log:", error);
    }
  };

  const formatarData = (data) => {
    if (!data) return "Nunca";

    // Converter Timestamp do Firebase para Date
    if (data?.toDate) {
      return data.toDate().toLocaleString("pt-BR");
    }

    return new Date(data).toLocaleString("pt-BR");
  };

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
      <LogAuditoria
        usuario={usuarioAuditoria}
        logs={logs.filter((log) => log.usuarioId === usuarioAuditoria?.id)}
        onVoltar={() => setVisualizarAuditoria(false)}
      />
    );
  }

  if (mostrarFormulario) {
    return (
      <FormularioUsuario
        usuario={usuarioEditando}
        roles={roles}
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
        onSuccess={() => {
          alert("✅ Convite enviado com sucesso!");
        }}
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
        <button
          onClick={handleNovoUsuario}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <UserPlus size={20} />
          <span>Novo Usuário</span>
        </button>
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
                        <button
                          onClick={() => handleToggleStatus(usuario)}
                          className={`p-2 rounded-lg transition-colors ${
                            usuario.ativo
                              ? "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                          }`}
                          title={usuario.ativo ? "Desativar" : "Ativar"}
                        >
                          {usuario.ativo ? (
                            <ToggleRight size={18} />
                          ) : (
                            <ToggleLeft size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleExcluirUsuario(usuario)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
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
            Tente ajustar os filtros ou criar um novo usuário
          </p>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
