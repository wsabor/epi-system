import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeToEPIs,
  createEPI as createEPIService,
  updateEPI as updateEPIService,
  deleteEPI as deleteEPIService,
} from "../services/epiServices";

export const useEPIs = () => {
  const { currentUser } = useAuth();
  const [epis, setEpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Só iniciar subscription se o usuário estiver autenticado
    if (!currentUser) {
      setEpis([]);
      setLoading(false);
      return;
    }

    console.log("🔄 Iniciando subscription de EPIs...");
    setLoading(true);

    // Subscrever para atualizações em tempo real
    const unsubscribe = subscribeToEPIs((episData) => {
      console.log("✅ EPIs carregados:", episData.length);
      setEpis(episData);
      setLoading(false);
    });

    // Cleanup: cancelar subscription quando componente desmontar
    return () => {
      console.log("🛑 Cancelando subscription de EPIs");
      unsubscribe();
    };
  }, [currentUser]); // ← ADICIONADA DEPENDÊNCIA

  const addEPI = async (epiData) => {
    try {
      setError(null);
      await createEPIService(epiData);
      // O listener atualizará automaticamente a lista
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEPI = async (id, epiData) => {
    try {
      setError(null);
      await updateEPIService(id, epiData);
      // O listener atualizará automaticamente a lista
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEPI = async (id) => {
    try {
      setError(null);
      await deleteEPIService(id);
      // O listener atualizará automaticamente a lista
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    epis,
    loading,
    error,
    addEPI,
    updateEPI,
    deleteEPI,
  };
};
