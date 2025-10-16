import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  where,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

const movimentacoesCollection = collection(db, "movimentacoes");

// Buscar todas as movimentações (com listener em tempo real)
export const subscribeToMovimentacoes = (callback) => {
  try {
    const q = query(
      movimentacoesCollection,
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const movimentacoes = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          movimentacoes.push({
            id: doc.id,
            ...data,
            data:
              data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          });
        });
        console.log("📦 Movimentações encontradas no Firebase:", movimentacoes.length);
        callback(movimentacoes);
      },
      (error) => {
        console.error("❌ Erro ao buscar movimentações:", error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("❌ Erro ao criar subscription de Movimentações:", error);
    callback([]);
    return () => {}; // Retorna função vazia para evitar erros
  }
};

// Buscar todas as movimentações (uma vez)
export const getAllMovimentacoes = async () => {
  try {
    const q = query(
      movimentacoesCollection,
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    const movimentacoes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movimentacoes.push({
        id: doc.id,
        ...data,
        data:
          data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      });
    });
    return movimentacoes;
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    throw error;
  }
};

// Criar nova movimentação
export const createMovimentacao = async (movimentacaoData) => {
  try {
    const docRef = await addDoc(movimentacoesCollection, {
      ...movimentacaoData,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...movimentacaoData,
      data: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    throw error;
  }
};

// Buscar movimentações de um EPI específico
export const getMovimentacoesByEPI = async (epiId) => {
  try {
    const q = query(
      movimentacoesCollection,
      where("epiId", "==", epiId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const movimentacoes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movimentacoes.push({
        id: doc.id,
        ...data,
        data:
          data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      });
    });
    return movimentacoes;
  } catch (error) {
    console.error("Erro ao buscar movimentações do EPI:", error);
    throw error;
  }
};
