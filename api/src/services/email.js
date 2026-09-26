import { config } from "../config.js";
import { ROLES } from "../dominio.js";

const URL_EMAILJS = "https://api.emailjs.com/api/v1.0/email/send";

// Retorna true se enviou. Em desenvolvimento, com o EmailJS vazio ou incompleto, o e-mail é só mostrado no console
// (o config.js exige todas as variáveis em produção).
async function enviar(templateId, destinatario, parametros) {
  const faltando = Object.entries({
    EMAILJS_SERVICE_ID: config.EMAILJS_SERVICE_ID,
    EMAILJS_PUBLIC_KEY: config.EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY: config.EMAILJS_PRIVATE_KEY,
    template: templateId,
  })
    .filter(([, valor]) => !valor)
    .map(([nome]) => nome);

  if (faltando.length) {
    console.log(`[e-mail não enviado: falta ${faltando.join(", ")}] para ${destinatario}`, parametros);
    return false;
  }

  const resposta = await fetch(URL_EMAILJS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: config.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: config.EMAILJS_PUBLIC_KEY,
      accessToken: config.EMAILJS_PRIVATE_KEY,
      template_params: { to_email: destinatario, ...parametros },
    }),
  });

  if (!resposta.ok) {
    throw new Error(`EmailJS respondeu ${resposta.status}: ${await resposta.text()}`);
  }
  return true;
}

// Mesmos parâmetros do template que o frontend antigo usava.
export function enviarEmailConvite({ nome, email, departamento, role, link }) {
  return enviar(config.EMAILJS_TEMPLATE_CONVITE, email, {
    nome,
    email,
    departamento,
    role: ROLES[role],
    convite_url: link,
  });
}

export function enviarEmailRedefinicaoSenha({ nome, email, link }) {
  return enviar(config.EMAILJS_TEMPLATE_REDEFINIR_SENHA, email, {
    nome,
    redefinir_url: link,
    validade: "1 hora",
  });
}
