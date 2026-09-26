import React, { useState } from "react";
import { Mail, Send, X, QrCode, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useOpcoes } from "../../hooks/useOpcoes";

const FORM_VAZIO = {
  nome: "",
  email: "",
  departamento: "",
  telefone: "",
  role: "visualizador",
  enviarEmail: true,
};

const DESCRICAO_FUNCAO = {
  admin: "Acesso total: usuários, convites, auditoria e ativar/desativar EPIs",
  operador: "Cadastra/edita EPIs, registra movimentações, gera e exporta relatórios",
  visualizador: "Apenas consulta estoque e movimentações",
};

// criarConvite vem do useConvites da página: devolve { convite, link, emailEnviado, erroEmail }.
const ConviteUsuarioModal = ({ isOpen, onClose, criarConvite }) => {
  const opcoes = useOpcoes();
  const [formData, setFormData] = useState(FORM_VAZIO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(resultado.link);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      setResultado(await criarConvite(formData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(FORM_VAZIO);
    setError("");
    setResultado(null);
    setLinkCopiado(false);
    onClose();
  };

  if (!isOpen) return null;

  // Tela de sucesso com QR Code (o link só existe agora: o banco guarda apenas o hash do token)
  if (resultado) {
    const { convite, link, emailEnviado, erroEmail } = resultado;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Convite criado!</h2>
                <p className="text-sm text-gray-500">
                  Para {convite.nome} ({convite.email})
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {emailEnviado && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <Mail size={20} className="text-green-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-800">E-mail com o convite enviado para {convite.email}.</p>
              </div>
            )}
            {erroEmail && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                <AlertTriangle size={20} className="text-yellow-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{erroEmail}</p>
              </div>
            )}

            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <QrCode size={20} className="text-red-600" />
                <h3 className="font-semibold text-gray-900">QR Code do Convite</h3>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <QRCodeSVG value={link} size={200} level="H" marginSize={2} />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  O usuário pode escanear este QR Code com a câmera do celular
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Link do Convite</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={copiarLink}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  {linkCopiado ? <CheckCircle size={18} /> : <Copy size={18} />}
                  <span>{linkCopiado ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> o convite expira em{" "}
                {new Date(convite.expiraEm).toLocaleDateString("pt-BR")}, só pode ser usado uma vez e{" "}
                <strong>este link não poderá ser exibido de novo</strong>. Se perder, crie outro convite (o anterior é
                cancelado automaticamente).
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const campoTexto = (name, label, props = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        {...props}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Mail size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Convidar Novo Usuário</h2>
              <p className="text-sm text-gray-500">O usuário receberá um link para definir sua senha</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campoTexto("nome", "Nome Completo *", { type: "text", required: true, maxLength: 150, placeholder: "João Silva" })}
              {campoTexto("email", "Email *", { type: "email", required: true, placeholder: "joao@empresa.com" })}
              {campoTexto("telefone", "Telefone", { type: "tel", maxLength: 30, placeholder: "(11) 98765-4321" })}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione o departamento</option>
                  {opcoes?.departamentos.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Função e Permissões</h3>
            <div className="space-y-3">
              {Object.entries(opcoes?.roles ?? {}).map(([role, nome]) => (
                <label key={role} className="block">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="font-medium">{nome}</span>
                  <span className="text-sm text-gray-600 block ml-6">{DESCRICAO_FUNCAO[role]}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="enviarEmail"
              checked={formData.enviarEmail}
              onChange={handleChange}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Enviar o convite por e-mail</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Send size={18} />
              <span>{loading ? "Criando..." : "Criar Convite"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConviteUsuarioModal;
