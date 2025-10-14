// src/utils/seedUsuarios.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export const seedUsuarios = async () => {
  const usuariosIniciais = [
    {
      nome: "Admin Sistema",
      email: "admin@senai.br",
      role: "admin",
      departamento: "TI",
      telefone: "(11) 98765-4321",
      ativo: true,
    },
    {
      nome: "João Silva",
      email: "joao.silva@senai.br",
      role: "operador",
      departamento: "Almoxarifado",
      telefone: "(11) 98765-1234",
      ativo: true,
    },
    {
      nome: "Maria Santos",
      email: "maria.santos@senai.br",
      role: "visualizador",
      departamento: "Segurança",
      telefone: "(11) 98765-5678",
      ativo: true,
    },
  ];

  try {
    const usuariosRef = collection(db, "usuarios");

    for (const usuario of usuariosIniciais) {
      await addDoc(usuariosRef, {
        ...usuario,
        dataCriacao: serverTimestamp(),
        ultimoAcesso: null,
      });
    }

    console.log("✅ Usuários iniciais criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar usuários iniciais:", error);
  }
};
