import emailjs from "@emailjs/browser";

// Configurações do EmailJS
const EMAILJS_CONFIG = {
  serviceId: "service_uxp7s0j", // ← SUBSTITUA COM SEU SERVICE ID
  templateId: "template_p8x0302", // ← SUBSTITUA COM SEU TEMPLATE ID
  publicKey: "vNLf8Y2MXeeMUd2Wk", // ← SUBSTITUA COM SUA PUBLIC KEY
};

/**
 * Envia email de convite para novo usuário
 * @param {Object} params - Parâmetros do email
 * @param {string} params.nome - Nome do usuário
 * @param {string} params.email - Email do usuário
 * @param {string} params.departamento - Departamento do usuário
 * @param {string} params.role - Função do usuário
 * @param {string} params.conviteUrl - URL do convite
 */
export const enviarEmailConvite = async ({
  nome,
  email,
  departamento,
  role,
  conviteUrl,
}) => {
  try {
    // Mapear roles para português
    const rolesMap = {
      admin: "Administrador",
      operador: "Operador",
      visualizador: "Visualizador",
    };

    const templateParams = {
      nome,
      email,
      departamento,
      role: rolesMap[role] || role,
      convite_url: conviteUrl,
      to_email: email, // Email do destinatário
    };

    console.log("📧 Enviando email para:", email);
    console.log("📋 Parâmetros:", templateParams);

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log("✅ Email enviado com sucesso!", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Valida se as configurações do EmailJS estão corretas
 */
export const validarConfiguracoesEmail = () => {
  const { serviceId, templateId, publicKey } = EMAILJS_CONFIG;

  if (
    serviceId === "SEU_SERVICE_ID" ||
    templateId === "SEU_TEMPLATE_ID" ||
    publicKey === "SUA_PUBLIC_KEY"
  ) {
    console.warn(
      "⚠️ ATENÇÃO: Configure as credenciais do EmailJS em src/services/emailService.js"
    );
    return false;
  }

  return true;
};
