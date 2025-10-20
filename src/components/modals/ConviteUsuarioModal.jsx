import React, { useState } from "react";
import { Mail, Send, X, QrCode, Copy, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { enviarEmailConvite, validarConfiguracoesEmail } from "../../services/emailService";

const ConviteUsuarioModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    departamento: "",
    telefone: "",
    role: "visualizador",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conviteCriado, setConviteCriado] = useState(null);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const copiarLink = () => {
    if (conviteCriado) {
      navigator.clipboard.writeText(conviteCriado.url);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    }
  };

  const enviarEmail = async () => {
    if (!conviteCriado) return;

    // Validar configurações
    if (!validarConfiguracoesEmail()) {
      alert(
        "⚠️ As configurações do EmailJS não foram definidas.\n\n" +
        "Por favor, configure suas credenciais em:\n" +
        "src/services/emailService.js"
      );
      return;
    }

    setEnviandoEmail(true);

    const resultado = await enviarEmailConvite({
      nome: formData.nome,
      email: formData.email,
      departamento: formData.departamento,
      role: formData.role,
      conviteUrl: conviteCriado.url,
    });

    setEnviandoEmail(false);

    if (resultado.success) {
      alert("✅ Email enviado com sucesso!");
    } else {
      alert(`❌ Erro ao enviar email: ${resultado.error}\n\nVocê pode copiar o link e enviar manualmente.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gerar token único para o convite
      const token = generateToken();
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 7); // Expira em 7 dias

      // Criar convite no Firestore
      const conviteRef = await addDoc(collection(db, "convites"), {
        ...formData,
        token,
        status: "pendente",
        dataCriacao: serverTimestamp(),
        dataExpiracao: dataExpiracao.toISOString(),
        usado: false,
      });

      const conviteUrl = `${window.location.origin}/aceitar-convite/${token}`;
      
      setConviteCriado({
        id: conviteRef.id,
        url: conviteUrl,
        token,
      });

    } catch (err) {
      console.error("❌ Erro ao criar convite:", err);
      setError(err.message || "Erro ao criar convite");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      email: "",
      departamento: "",
      telefone: "",
      role: "visualizador",
    });
    setError("");
    setConviteCriado(null);
    setLinkCopiado(false);
    onClose();
  };

  const finalizarConvite = () => {
    onSuccess();
    handleClose();
  };

  if (!isOpen) return null;

  // Tela de sucesso com QR Code
  if (conviteCriado) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Convite Criado com Sucesso!
                </h2>
                <p className="text-sm text-gray-500">
                  Envie o link para {formData.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Informações do Usuário */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Informações do Convite</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <p className="font-medium text-gray-900">{formData.nome}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Departamento:</span>
                  <p className="font-medium text-gray-900">{formData.departamento}</p>
                </div>
                <div>
                  <span className="text-gray-600">Função:</span>
                  <p className="font-medium text-gray-900">
                    {formData.role === "admin" && "Administrador"}
                    {formData.role === "operador" && "Operador"}
                    {formData.role === "visualizador" && "Visualizador"}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <QrCode size={20} className="text-red-600" />
                <h3 className="font-semibold text-gray-900">QR Code do Convite</h3>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <QRCodeSVG
                    value={conviteCriado.url}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  O usuário pode escanear este QR Code com a câmera do celular
                </p>
              </div>
            </div>

            {/* Link do Convite */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Link do Convite</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={conviteCriado.url}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={copiarLink}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  {linkCopiado ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Importante:</strong> Este convite expira em 7 dias e só pode ser usado uma vez.
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={enviarEmail}
                disabled={enviandoEmail}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {enviandoEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando Email...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Enviar por Email</span>
                  </>
                )}
              </button>
              <button
                onClick={finalizarConvite}
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

  // Formulário de criação
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Mail size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Convidar Novo Usuário
              </h2>
              <p className="text-sm text-gray-500">
                O usuário receberá um link para definir sua senha
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="joao@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento *
                </label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Almoxarifado"
                />
              </div>
            </div>
          </div>

          {/* Função e Permissões */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Função e Permissões
            </h3>
            <div className="space-y-3">
              <label className="block">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === "admin"}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span className="font-medium">Administrador</span>
                <span className="text-sm text-gray-600 block ml-6">
                  Acesso total ao sistema
                </span>
              </label>

              <label className="block">
                <input
                  type="radio"
                  name="role"
                  value="operador"
                  checked={formData.role === "operador"}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span className="font-medium">Operador</span>
                <span className="text-sm text-gray-600 block ml-6">
                  Pode criar/editar EPIs e movimentações
                </span>
              </label>

              <label className="block">
                <input
                  type="radio"
                  name="role"
                  value="visualizador"
                  checked={formData.role === "visualizador"}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span className="font-medium">Visualizador</span>
                <span className="text-sm text-gray-600 block ml-6">
                  Apenas visualização
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
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
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Criar Convite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConviteUsuarioModal;
