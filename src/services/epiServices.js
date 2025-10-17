import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

const episCollection = collection(db, "epis");

// Buscar todos os EPIs (com listener em tempo real)
export const subscribeToEPIs = (callback) => {
  try {
    const q = query(episCollection, orderBy("descricao"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const epis = [];
        snapshot.forEach((doc) => {
          epis.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        console.log("📦 EPIs encontrados no Firebase:", epis.length);
        callback(epis);
      },
      (error) => {
        console.error("❌ Erro ao buscar EPIs:", error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("❌ Erro ao criar subscription de EPIs:", error);
    callback([]);
    return () => {}; // Retorna função vazia para evitar erros
  }
};

// Buscar todos os EPIs (uma vez)
export const getAllEPIs = async () => {
  try {
    const q = query(episCollection, orderBy("descricao"));
    const querySnapshot = await getDocs(q);
    const epis = [];
    querySnapshot.forEach((doc) => {
      epis.push({ id: doc.id, ...doc.data() });
    });
    return epis;
  } catch (error) {
    console.error("Erro ao buscar EPIs:", error);
    throw error;
  }
};

// Criar novo EPI
export const createEPI = async (epiData) => {
  try {
    // Remover campos que não devem ser salvos
    const { id, createdAt, updatedAt, status, ...dataToCreate } = epiData;

    const docRef = await addDoc(episCollection, {
      ...dataToCreate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...dataToCreate };
  } catch (error) {
    console.error("Erro ao criar EPI:", error);
    throw error;
  }
};

// Atualizar EPI
export const updateEPI = async (id, epiData) => {
  try {
    // Garantir que id é uma string
    const docId = String(id);
    const epiRef = doc(db, "epis", docId);

    // Remover campos que não devem ser atualizados
    const { id: _, createdAt, updatedAt, status, ...dataToUpdate } = epiData;

    await updateDoc(epiRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp(),
    });

    return { id: docId, ...epiData };
  } catch (error) {
    console.error("Erro ao atualizar EPI:", error);
    throw error;
  }
};

// Deletar EPI
export const deleteEPI = async (id) => {
  try {
    const docId = String(id);
    await deleteDoc(doc(db, "epis", docId));
  } catch (error) {
    console.error("Erro ao deletar EPI:", error);
    throw error;
  }
};
