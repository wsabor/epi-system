import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

const episCollection = collection(db, "epis");

// Buscar todos os EPIs (com listener em tempo real)
export const subscribeToEPIs = (callback) => {
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
      callback(epis);
    },
    (error) => {
      console.error("Erro ao buscar EPIs:", error);
      callback([]);
    }
  );

  return unsubscribe;
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
    console.log("🔍 DEBUG - Iniciando atualização");
    console.log("📝 ID:", id, "Tipo:", typeof id);

    // Garantir que id é uma string
    const docId = String(id);
    const epiRef = doc(db, "epis", docId);

    const docSnap = await getDoc(epiRef);
    if (!docSnap.exists()) {
      throw new Error(
        `Documento com ID ${docId} não existe no Firestore. Esse EPI pode ter sido criado apenas localmente.`
      );
    }

    console.log("✅ Documento existe no Firestore");

    // Remover campos que não devem ser atualizados
    const { id: _, createdAt, updatedAt, status, ...dataToUpdate } = epiData;
    console.log("📝 Dados a atualizar:", JSON.stringify(dataToUpdate, null, 2));

    await updateDoc(epiRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ EPI atualizado com sucesso!");
    return { id: docId, ...epiData };
  } catch (error) {
    console.error("❌ Erro ao atualizar EPI:", error.message);
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
