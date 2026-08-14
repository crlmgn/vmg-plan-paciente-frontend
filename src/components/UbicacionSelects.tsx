import { useEffect, useState } from "react";
import { listarCantones, listarDistritos, listarProvincias } from "../api/ubicaciones";
import { extractErrorMessage } from "../api/client";
import { comoArray } from "../utils/arrays";
import type { Canton, Distrito, Provincia } from "../types";

interface UbicacionSelectsProps {
  provinciaId: string;
  cantonId: string;
  distritoId: string;
  onChange: (siguiente: { provinciaId: string; cantonId: string; distritoId: string }) => void;
}

/** Selects en cascada provincia → cantón → distrito, usados tanto en el
 * registro público de farmacias como en su edición desde el panel admin —
 * la lógica de carga en cascada no se duplica entre ambos. */
export function UbicacionSelects({
  provinciaId,
  cantonId,
  distritoId,
  onChange,
}: UbicacionSelectsProps) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarProvincias()
      .then((data) => setProvincias(comoArray<Provincia>(data)))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  useEffect(() => {
    if (!provinciaId) {
      setCantones([]);
      return;
    }
    listarCantones(Number(provinciaId))
      .then((data) => setCantones(comoArray<Canton>(data)))
      .catch((err) => setError(extractErrorMessage(err)));
  }, [provinciaId]);

  useEffect(() => {
    if (!cantonId) {
      setDistritos([]);
      return;
    }
    listarDistritos(Number(cantonId))
      .then((data) => setDistritos(comoArray<Distrito>(data)))
      .catch((err) => setError(extractErrorMessage(err)));
  }, [cantonId]);

  return (
    <>
      {error && <p className="field-error">{error}</p>}

      <label>
        Provincia
        <select
          value={provinciaId}
          onChange={(e) => onChange({ provinciaId: e.target.value, cantonId: "", distritoId: "" })}
          required
        >
          <option value="">Seleccioná una provincia</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Cantón
        <select
          value={cantonId}
          onChange={(e) => onChange({ provinciaId, cantonId: e.target.value, distritoId: "" })}
          disabled={!provinciaId}
          required
        >
          <option value="">Seleccioná un cantón</option>
          {cantones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Distrito
        <select
          value={distritoId}
          onChange={(e) => onChange({ provinciaId, cantonId, distritoId: e.target.value })}
          disabled={!cantonId}
          required
        >
          <option value="">Seleccioná un distrito</option>
          {distritos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
