import { useState, useEffect } from "react";
import {
  subscribeToEPIs,
  createEPI as createEPIService,
  updateEPI as updateEPIService,
  deleteEPI as deleteEPIService,
} from "../services/epiServices";

export const useEPIs = () => {
  const [epis, setEpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // Subscrever para atualizações em tempo real
    const unsubscribe = subscribeToEPIs((episData) => {
      setEpis(episData);
      setLoading(false);
    });

    // Cleanup: cancelar subscription quando componente desmontar
    return () => unsubscribe();
  }, []);

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
