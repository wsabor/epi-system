import { config } from "../config.js";
import { ROLES } from "../dominio.js";

const URL_EMAILJS = "https://api.emailjs.com/api/v1.0/email/send";

const emailConfigurado = Boolean(config.EMAILJS_SERVICE_ID && config.EMAILJS_PRIVATE_KEY);

// Em desenvolvimento, sem EmailJS configurado, o e-mail é só mostrado no console
// (o config.js exige as variáveis em produção).
async function enviar(templateId, destinatario, parametros) {
  if (!emailConfigurado) {
    console.log(`[e-mail não enviado: EmailJS não configurado] para ${destinatario}`, parametros);
    return;
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
