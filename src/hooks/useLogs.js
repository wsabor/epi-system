import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const useLogs = (usuarioId = null) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const logsRef = collection(db, "logs");

    // Query simples sem where para evitar necessidade de índice composto
    const logsQuery = query(
      logsRef,
      orderBy("timestamp", "desc"),
      limit(1000)
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        let logsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Se houver filtro de usuarioId, filtrar no lado do cliente
        if (usuarioId) {
          logsData = logsData.filter((log) => log.usuarioId === usuarioId);
        }

        setLogs(logsData);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar logs:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usuarioId]);

  // Adicionar novo log
  const addLog = async (logData) => {
    try {
      const logsRef = collection(db, "logs");
      const novoLog = {
        ...logData,
        timestamp: serverTimestamp(),
        ip: "192.168.1.100", // Pode ser substituído por IP real se quiser
      };

      const docRef = await addDoc(logsRef, novoLog);
      console.log("✅ Log criado com ID:", docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("❌ Erro ao adicionar log:", err);
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    addLog,
  };
};
